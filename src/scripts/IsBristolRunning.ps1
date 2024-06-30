param(
    [Parameter(Mandatory=$true)]
	[string]$appName
)

$appCommonName = $appName.Replace("Prevoir.", "").Split("-")[0]
$bristolName = "Prevoir.$($appCommonName).Bristol"
$process = (Get-Process "$($bristolName)" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "C:\Program Files\Groupe Prévoir\$($appName)*\$($bristolName).exe" })
Write-Host "$($null -ne $process)"