# File: packages/core-engine/scripts/download-model.ps1
# Purpose: Download Vosk small English model for offline STT

$modelUrl = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
$modelDir = "..\models"
$zipFile = "$modelDir\vosk-model-small-en-us-0.15.zip"
$extractDir = "$modelDir\vosk-model-small-en-us-0.15"

Write-Host "Creating models directory..."
New-Item -ItemType Directory -Force -Path $modelDir | Out-Null

if (Test-Path $extractDir) {
    Write-Host "Model already exists at $extractDir"
    exit 0
}

Write-Host "Downloading Vosk model (40MB)..."
Write-Host "This may take a few minutes..."

try {
    Invoke-WebRequest -Uri $modelUrl -OutFile $zipFile
    Write-Host "Download complete!"
    
    Write-Host "Extracting model..."
    Expand-Archive -Path $zipFile -DestinationPath $modelDir -Force
    
    Write-Host "Cleaning up..."
    Remove-Item $zipFile
    
    Write-Host ""
    Write-Host "✅ Model downloaded successfully to: $extractDir"
    Write-Host "Update your .env file: MODEL_DIR=$extractDir"
} catch {
    Write-Host "❌ Error downloading model: $_"
    exit 1
}
