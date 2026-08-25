param(
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot "manifest.json") -Raw | ConvertFrom-Json
if (-not $OutputPath) {
  $OutputPath = "ApplyFlow-Edge-$($manifest.version).zip"
}

$output = Join-Path $projectRoot $OutputPath
$items = @(
  "_locales",
  "content",
  "icons",
  "profile",
  "shared",
  "sidepanel",
  "background.js",
  "manifest.json"
)

if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output
}

$paths = $items | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $paths -DestinationPath $output -CompressionLevel Optimal
if (-not (Test-Path -LiteralPath $output)) {
  throw "Edge package was not created: $output"
}
Write-Output "Created Edge package: $output"
