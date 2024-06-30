param(
    [Parameter(Mandatory=$true)]
	[string]$environment
)

Write-Host "ApplicationName,ApplicationVersion,BristolVersion,UWPVersion"
$packageRegistryItems = Get-ChildItem -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
foreach ($packageRegistryItem in $packageRegistryItems) {
	$path = $packageRegistryItem.Name -replace "HKEY_LOCAL_MACHINE", "HKLM:"
	if ($path -like "*.sdb" -Or $path -like "* *") {
		continue
	}
	
    $key = Get-Item -LiteralPath "$($path)" -ErrorAction SilentlyContinue
    $propertyExists = $key -and $null -ne $key.GetValue("DisplayName", $null)
	if (-not $propertyExists) {
		continue
	}

	$applicationName = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayName" -ErrorAction SilentlyContinue
	if ($applicationName -And $applicationName -like "*$($environment)") {
		$applicationVersion = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayVersion" -ErrorAction SilentlyContinue
		$bristolExe = Get-ChildItem "C:\Program Files\Groupe Prévoir\$($applicationName)\Bristol\" -Filter "Prevoir.*.Bristol.exe"
		$bristolVersion = $bristolExe.VersionInfo.FileVersion
		$uwpVersion = Get-AppxPackage | Where-Object { $_.name -eq "$($applicationName)" } | Select-Object -ExpandProperty Version
		Write-Host "$($applicationName),$($applicationVersion),$($bristolVersion),$($uwpVersion)"
	}
}
