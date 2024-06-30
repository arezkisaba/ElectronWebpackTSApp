param(
    [string]$appName,
    [string]$protocol
)

$packageRegistryItems = Get-ChildItem -Path "HKCU:\SOFTWARE\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages\"
Foreach ($packageRegistryItem In $packageRegistryItems) {
    $keyFormatted = $packageRegistryItem.Name -replace "HKEY_CURRENT_USER", "HKCU:"
    $splitArray = $keyFormatted -split '\\'
    $itemName = $splitArray[-1]
    $packageRegistryKey = "$($keyFormatted)\App\Capabilities\URLAssociations"
    
    if (($itemName -like "$($appName)*") -And (Test-Path $keyFormatted)) {
        try {
            Get-ItemPropertyValue -Path "$($packageRegistryKey)" -Name "$($protocol)" > $null
            Write-Host "$($true)"
            return
        }
        catch {
        }
    }
}

Write-Host "$($false)"