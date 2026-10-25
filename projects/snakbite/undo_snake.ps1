# Restore Previous Snake Version
$backupDir = Join-Path $PSScriptRoot ".backup_snake_v1"
if (Test-Path $backupDir) {
    Copy-Item "$backupDir\index.html" "$PSScriptRoot\index.html" -Force
    Copy-Item "$backupDir\script.js" "$PSScriptRoot\script.js" -Force
    Copy-Item "$backupDir\style.css" "$PSScriptRoot\style.css" -Force
    Write-Host "Restored index.html, script.js, and style.css to previous snake version successfully."
} else {
    Write-Error "Backup directory .backup_snake_v1 not found!"
}
