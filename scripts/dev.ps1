$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    $bundledNodeDir = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
    if (-not (Test-Path -LiteralPath (Join-Path $bundledNodeDir 'node.exe'))) {
        throw '请先安装 Node.js 22.13+，并将 node 添加到 PATH。'
    }
    $env:Path = $bundledNodeDir + ';' + $env:Path
}
$devCommand = Join-Path $projectDir 'node_modules\.bin\vinext.cmd'
if (-not (Test-Path -LiteralPath $devCommand)) { throw '尚未安装项目依赖，请运行 pnpm install。' }
Set-Location -LiteralPath $projectDir
& $devCommand dev
exit $LASTEXITCODE
