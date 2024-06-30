param(
    [Parameter(Mandatory=$true)]
	[string]$environment
)

$productItems = @()
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

	$packageName = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayName" -ErrorAction SilentlyContinue
	$packageVersion = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayVersion" -ErrorAction SilentlyContinue
	if ($packageName -And $packageName -like "*$($environment)") {
		$productItem = [PSCustomObject]@{
			PackageName    = $packageName
			PackageVersion = $packageVersion
		}
		$productItems += $productItem
		Write-Host "PackageName=$($packageName);PackageVersion=$($packageVersion)"
	}
}
