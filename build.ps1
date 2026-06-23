$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $root 'dist'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$csc = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) { $csc = "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe" }
if (-not (Test-Path $csc)) { throw 'Windows C# compiler not found.' }
$tempExe = Join-Path ([IO.Path]::GetTempPath()) ("GaussianSplatterEffectsStudio-build-{0}.exe" -f $PID)

& $csc /nologo /optimize+ /target:winexe /platform:anycpu `
    /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll `
    /resource:"$root\web\index.html",index.html `
    /resource:"$root\web\app.js",app.js `
    /resource:"$root\web\style.css",style.css `
    /resource:"$root\web\playcanvas.min.js",playcanvas.min.js `
    /resource:"$root\web\PLAYCANVAS-LICENSE.txt",PLAYCANVAS-LICENSE.txt `
    /out:"$tempExe" `
    "$root\Launcher.cs"

if ($LASTEXITCODE -ne 0) { throw "Compilation failed with exit code $LASTEXITCODE" }
$destination = Join-Path $out 'GaussianSplatterEffectsStudio.exe'
try {
    Copy-Item -LiteralPath $tempExe -Destination $destination -Force -ErrorAction Stop
} catch [System.UnauthorizedAccessException] {
    $destination = Join-Path $out 'GaussianSplatterEffectsStudio-Updated.exe'
    Copy-Item -LiteralPath $tempExe -Destination $destination -Force
    Write-Warning 'The main EXE is running and locked. Wrote GaussianSplatterEffectsStudio-Updated.exe instead.'
}
Remove-Item -LiteralPath $tempExe -Force
Get-Item $destination | Select-Object FullName, Length, LastWriteTime
