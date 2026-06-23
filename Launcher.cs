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

namespace RemySplatStudio
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
            acceptThread = new Thread(AcceptLoop) { IsBackground = true, Name = "RemySplatStudio.Server" };
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
                    stream.ReadTimeout = 5000;
                    StreamReader reader = new StreamReader(stream, Encoding.ASCII, false, 4096, true);
                    string requestLine = reader.ReadLine();
                    if (String.IsNullOrEmpty(requestLine)) return;
                    string line;
                    do { line = reader.ReadLine(); } while (!String.IsNullOrEmpty(line));

                    string[] parts = requestLine.Split(' ');
                    string path = parts.Length > 1 ? parts[1].Split('?')[0] : "/";
                    string resourceName;
                    if (!resources.TryGetValue(path, out resourceName))
                    {
                        WriteResponse(stream, 404, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Not found"));
                        return;
                    }

                    byte[] bytes = ReadResource(resourceName);
                    string mime = resourceName.EndsWith(".js") ? "text/javascript; charset=utf-8" :
                                  resourceName.EndsWith(".css") ? "text/css; charset=utf-8" :
                                  "text/html; charset=utf-8";
                    WriteResponse(stream, 200, mime, bytes);
                }
                catch { }
            }
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
            string reason = status == 200 ? "OK" : "Not Found";
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
            Text = "Remy Splat Studio";
            ClientSize = new Size(460, 225);
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
                Text = "Remy Splat Studio",
                Font = new Font("Microsoft YaHei UI", 19F, FontStyle.Bold),
                ForeColor = Color.FromArgb(102, 224, 255),
                AutoSize = true,
                Location = new Point(28, 24)
            };
            Label text = new Label
            {
                Text = "高斯粒子动画与高画质视频导出\n界面将在 Microsoft Edge 独立窗口中运行，所有文件仅在本机处理。",
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
                MessageBox.Show("未找到 Microsoft Edge。请安装 Edge 后重试。", "Remy Splat Studio", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
