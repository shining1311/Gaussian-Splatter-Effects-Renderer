using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace GaussianSplatterEffectsStudio
{
    internal sealed class LocalServer : IDisposable
    {
        private readonly TcpListener listener;
        private readonly Thread acceptThread;
        private volatile bool running = true;
        private readonly Dictionary<string, string> resources = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "/", "index.html" },
            { "/index.html", "index.html" },
            { "/app.js", "app.js" },
            { "/style.css", "style.css" },
            { "/playcanvas.min.js", "playcanvas.min.js" },
            { "/PLAYCANVAS-LICENSE.txt", "PLAYCANVAS-LICENSE.txt" }
        };

        public int Port { get; private set; }

        public LocalServer()
        {
            listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            Port = ((IPEndPoint)listener.LocalEndpoint).Port;
            acceptThread = new Thread(AcceptLoop) { IsBackground = true, Name = "GaussianSplatterEffectsStudio.Server" };
            acceptThread.Start();
        }

        private void AcceptLoop()
        {
            while (running)
            {
                try
                {
                    TcpClient client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(_ => HandleClient(client));
                }
                catch (SocketException)
                {
                    if (!running) return;
                }
                catch (ObjectDisposedException) { return; }
            }
        }

        private void HandleClient(TcpClient client)
        {
            using (client)
            using (NetworkStream stream = client.GetStream())
            {
                try
                {
                    stream.ReadTimeout = 120000;
                    HttpRequest request = ReadRequest(stream);
                    if (request == null) return;
                    string requestLine = request.RequestLine;
                    if (String.IsNullOrEmpty(requestLine)) return;

                    string[] parts = requestLine.Split(' ');
                    string method = parts.Length > 0 ? parts[0] : "GET";
                    string target = parts.Length > 1 ? parts[1] : "/";
                    string path = target.Split('?')[0];
                    if (path.StartsWith("/api/remux", StringComparison.OrdinalIgnoreCase))
                    {
                        HandleRemuxApi(stream, method, target, request.Body);
                        return;
                    }

                    string resourceName;
                    if (!resources.TryGetValue(path, out resourceName))
                    {
                        WriteResponse(stream, 404, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Not found"));
                        return;
                    }

                    byte[] bytes = ReadResource(resourceName);
                    string mime = resourceName.EndsWith(".js") ? "text/javascript; charset=utf-8" :
                                  resourceName.EndsWith(".css") ? "text/css; charset=utf-8" :
                                  resourceName.EndsWith(".txt") ? "text/plain; charset=utf-8" :
                                  "text/html; charset=utf-8";
                    WriteResponse(stream, 200, mime, bytes);
                }
                catch { }
            }
        }

        private static HttpRequest ReadRequest(NetworkStream stream)
        {
            MemoryStream raw = new MemoryStream();
            byte[] buffer = new byte[8192];
            int headerEnd = -1;
            while (headerEnd < 0)
            {
                int read = stream.Read(buffer, 0, buffer.Length);
                if (read <= 0) return null;
                raw.Write(buffer, 0, read);
                byte[] bytes = raw.ToArray();
                headerEnd = FindHeaderEnd(bytes);
                if (bytes.Length > 1024 * 1024) throw new InvalidOperationException("Request header too large");
            }

            byte[] all = raw.ToArray();
            string headerText = Encoding.ASCII.GetString(all, 0, headerEnd);
            string[] lines = headerText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            int contentLength = 0;
            for (int i = 1; i < lines.Length; i++)
            {
                int colon = lines[i].IndexOf(':');
                if (colon <= 0) continue;
                string name = lines[i].Substring(0, colon).Trim();
                string value = lines[i].Substring(colon + 1).Trim();
                if (name.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
                    Int32.TryParse(value, out contentLength);
            }

            byte[] body = new byte[contentLength];
            int bodyStart = headerEnd + 4;
            int already = Math.Max(0, Math.Min(contentLength, all.Length - bodyStart));
            if (already > 0) Buffer.BlockCopy(all, bodyStart, body, 0, already);
            while (already < contentLength)
            {
                int read = stream.Read(body, already, contentLength - already);
                if (read <= 0) break;
                already += read;
            }
            return new HttpRequest { RequestLine = lines.Length > 0 ? lines[0] : "", Body = body };
        }

        private static int FindHeaderEnd(byte[] bytes)
        {
            for (int i = 3; i < bytes.Length; i++)
            {
                if (bytes[i - 3] == 13 && bytes[i - 2] == 10 && bytes[i - 1] == 13 && bytes[i] == 10)
                    return i - 3;
            }
            return -1;
        }

        private void HandleRemuxApi(NetworkStream stream, string method, string target, byte[] body)
        {
            if (target.StartsWith("/api/remux/status", StringComparison.OrdinalIgnoreCase))
            {
                WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":true,\"ffmpeg\":" + JsonString(FindFfmpeg()) + "}"));
                return;
            }
            if (!method.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                WriteResponse(stream, 405, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Method not allowed"));
                return;
            }
            string ffmpeg = FindFfmpeg();
            if (ffmpeg == null)
            {
                WriteResponse(stream, 500, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("未找到 ffmpeg.exe，无法无损修复索引。"));
                return;
            }
            Dictionary<string, string> query = ParseQuery(target);
            string filename = query.ContainsKey("filename") ? query["filename"] : "rendered.webm";
            string ext = Path.GetExtension(filename).ToLowerInvariant();
            if (ext != ".mp4" && ext != ".webm" && ext != ".mkv") ext = ".webm";
            string id = DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
            string dir = Path.Combine(Path.GetTempPath(), "GaussianSplatterEffectsStudio", "remux-" + id);
            Directory.CreateDirectory(dir);
            string input = Path.Combine(dir, "input" + ext);
            string output = Path.Combine(dir, "seekable" + ext);
            File.WriteAllBytes(input, body ?? new byte[0]);
            string error = RemuxWithFfmpeg(ffmpeg, input, output);
            if (error != null)
            {
                WriteResponse(stream, 500, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes(error));
                return;
            }
            WriteDownload(stream, output, "video/" + (ext == ".mp4" ? "mp4" : "webm"), MakeSeekableName(filename, ext));
        }

        private static string RemuxWithFfmpeg(string ffmpeg, string input, string output)
        {
            string args = "-y -hide_banner -loglevel error -i \"" + input + "\" -map 0 -c copy \"" + output + "\"";
            ProcessStartInfo info = new ProcessStartInfo(ffmpeg, args)
            {
                UseShellExecute = false,
                RedirectStandardError = true,
                CreateNoWindow = true
            };
            using (Process process = Process.Start(info))
            {
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit();
                if (process.ExitCode == 0 && File.Exists(output) && new FileInfo(output).Length > 0) return null;
                return String.IsNullOrWhiteSpace(error) ? "FFmpeg 无损重封装失败" : error.Trim();
            }
        }

        private static string MakeSeekableName(string filename, string ext)
        {
            string name = Path.GetFileNameWithoutExtension(filename);
            if (String.IsNullOrWhiteSpace(name)) name = "GaussianSplatterEffectsStudio";
            return name + "_seekable" + ext;
        }

        private static Dictionary<string, string> ParseQuery(string target)
        {
            Dictionary<string, string> result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            int q = target.IndexOf('?');
            if (q < 0) return result;
            string[] pairs = target.Substring(q + 1).Split('&');
            foreach (string pair in pairs)
            {
                if (String.IsNullOrEmpty(pair)) continue;
                int eq = pair.IndexOf('=');
                string key = eq >= 0 ? pair.Substring(0, eq) : pair;
                string value = eq >= 0 ? pair.Substring(eq + 1) : "";
                result[Uri.UnescapeDataString(key)] = Uri.UnescapeDataString(value.Replace("+", " "));
            }
            return result;
        }

        private static string FindFfmpeg()
        {
            string exeDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            string local = Path.Combine(exeDir, "ffmpeg.exe");
            if (File.Exists(local)) return local;
            string winget = FindNewestFfmpegIn(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "WinGet", "Packages"));
            if (winget != null) return winget;
            string path = Environment.GetEnvironmentVariable("PATH") ?? "";
            foreach (string dir in path.Split(Path.PathSeparator))
            {
                try
                {
                    if (String.IsNullOrWhiteSpace(dir)) continue;
                    string candidate = Path.Combine(dir.Trim(), "ffmpeg.exe");
                    if (File.Exists(candidate)) return candidate;
                }
                catch { }
            }
            return null;
        }

        private static string FindNewestFfmpegIn(string root)
        {
            try
            {
                if (!Directory.Exists(root)) return null;
                string best = null;
                DateTime bestTime = DateTime.MinValue;
                foreach (string file in Directory.GetFiles(root, "ffmpeg.exe", SearchOption.AllDirectories))
                {
                    DateTime time = File.GetLastWriteTime(file);
                    if (best == null || time > bestTime)
                    {
                        best = file;
                        bestTime = time;
                    }
                }
                return best;
            }
            catch { return null; }
        }

        private static string JsonString(string value)
        {
            if (value == null) return "null";
            return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n") + "\"";
        }

        private static byte[] ReadResource(string name)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream input = assembly.GetManifestResourceStream(name))
            {
                if (input == null) throw new InvalidOperationException("Missing embedded resource: " + name);
                using (MemoryStream output = new MemoryStream())
                {
                    input.CopyTo(output);
                    return output.ToArray();
                }
            }
        }

        private static void WriteResponse(Stream stream, int status, string mime, byte[] body)
        {
            string reason = status == 200 ? "OK" : status == 404 ? "Not Found" : status == 405 ? "Method Not Allowed" : "Error";
            string headers = "HTTP/1.1 " + status + " " + reason + "\r\n" +
                             "Content-Type: " + mime + "\r\n" +
                             "Content-Length: " + body.Length + "\r\n" +
                             "Cache-Control: no-store\r\n" +
                             "Cross-Origin-Resource-Policy: same-origin\r\n" +
                             "Connection: close\r\n\r\n";
            byte[] head = Encoding.ASCII.GetBytes(headers);
            stream.Write(head, 0, head.Length);
            stream.Write(body, 0, body.Length);
        }

        private static void WriteDownload(Stream stream, string path, string mime, string filename)
        {
            byte[] body = File.ReadAllBytes(path);
            filename = (filename ?? Path.GetFileName(path)).Replace("\"", "");
            string headers = "HTTP/1.1 200 OK\r\n" +
                             "Content-Type: " + mime + "\r\n" +
                             "Content-Disposition: attachment; filename=\"" + filename + "\"\r\n" +
                             "Content-Length: " + body.Length + "\r\n" +
                             "Cache-Control: no-store\r\n" +
                             "Connection: close\r\n\r\n";
            byte[] head = Encoding.ASCII.GetBytes(headers);
            stream.Write(head, 0, head.Length);
            stream.Write(body, 0, body.Length);
        }

        private sealed class HttpRequest
        {
            public string RequestLine;
            public byte[] Body;
        }

        public void Dispose()
        {
            running = false;
            try { listener.Stop(); } catch { }
        }
    }

    internal sealed class LauncherForm : Form
    {
        private readonly LocalServer server;
        private readonly string url;

        public LauncherForm()
        {
            Text = "GaussianSplatterEffectsStudio";
            ClientSize = new Size(560, 225);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(18, 22, 27);
            ForeColor = Color.White;
            Font = new Font("Microsoft YaHei UI", 9F);

            server = new LocalServer();
            url = "http://127.0.0.1:" + server.Port + "/";

            Label title = new Label
            {
                Text = "GaussianSplatterEffectsStudio",
                Font = new Font("Microsoft YaHei UI", 17F, FontStyle.Bold),
                ForeColor = Color.FromArgb(102, 224, 255),
                AutoSize = true,
                Location = new Point(28, 24)
            };
            Label text = new Label
            {
                Text = "完整高斯渲染、多样化粒子特效、电影运镜与高画质视频导出\n界面将在 Microsoft Edge 独立窗口中运行，所有文件仅在本机处理。",
                AutoSize = true,
                Location = new Point(31, 76),
                ForeColor = Color.FromArgb(200, 208, 218)
            };
            Button open = MakeButton("打开制作界面", 31, 139, 170, Color.FromArgb(25, 147, 181));
            Button exit = MakeButton("退出", 218, 139, 95, Color.FromArgb(52, 60, 69));
            Label hint = new Label
            {
                Text = "制作期间请保持此窗口开启",
                AutoSize = true,
                Location = new Point(31, 190),
                ForeColor = Color.FromArgb(122, 135, 149)
            };
            open.Click += delegate { OpenStudio(); };
            exit.Click += delegate { Close(); };
            Controls.Add(title);
            Controls.Add(text);
            Controls.Add(open);
            Controls.Add(exit);
            Controls.Add(hint);
            Shown += delegate { OpenStudio(); };
            FormClosed += delegate { server.Dispose(); };
        }

        private Button MakeButton(string text, int x, int y, int width, Color color)
        {
            Button button = new Button
            {
                Text = text,
                Location = new Point(x, y),
                Size = new Size(width, 39),
                FlatStyle = FlatStyle.Flat,
                BackColor = color,
                ForeColor = Color.White,
                Cursor = Cursors.Hand
            };
            button.FlatAppearance.BorderSize = 0;
            return button;
        }

        private void OpenStudio()
        {
            string edge = FindEdge();
            if (edge == null)
            {
                MessageBox.Show("未找到 Microsoft Edge。请安装 Edge 后重试。", "GaussianSplatterEffectsStudio", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            ProcessStartInfo info = new ProcessStartInfo(edge,
                "--app=\"" + url + "\" --start-maximized --use-angle=d3d11 " +
                "--enable-gpu-rasterization --enable-zero-copy --force_high_performance_gpu")
            {
                UseShellExecute = true
            };
            Process.Start(info);
        }

        private static string FindEdge()
        {
            string[] candidates =
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "Edge", "Application", "msedge.exe")
            };
            foreach (string candidate in candidates) if (File.Exists(candidate)) return candidate;
            return null;
        }
    }

    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new LauncherForm());
        }
    }
}
