param(
	[Parameter(Mandatory=$true)]
	[string]$Environment
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "=> Correct-Associations" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Environment = $($Environment)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

function ProcessEnvironment {
	param(
		[Parameter(Mandatory=$true)]
		[string[]]$applications,
		[Parameter(Mandatory=$true)]
		[string]$environment
	)

	$packages = Get-AppxPackage -Name "*$($environment)*"

	$registryItems = Get-ChildItem -Path "HKCU:\SOFTWARE\Classes\"
	Foreach ($package In $packages) {
		if ($applications.Count -ge 1 -And ($applications | Where-Object { $package.PackageFullName -like "*$_*" }).Count -le 0) {
			continue
		}

		Foreach ($registryItem In $registryItems) {
			$path = $registryItem.Name -replace "HKEY_CURRENT_USER", "HKCU:"
			$path = "$($path)\Application"
			$pathOk = $path -like '*AppX*'
			
			if ((Test-Path $path) -And $pathOk) {
				$value = Get-ItemPropertyValue -Path "$($path)" -Name "ApplicationIcon"
				
				if ("$value" -like "*$($package.Name)*") {
					$shortName = $registryItem.Name | Split-Path -Leaf
					
					if ("$value" -like "*$($package.PackageFullName)*") {
						Write-Host "Match OK for $($package.PackageFullName) : $($shortName)"
					} else {
						Write-Host "Match KO for $($package.PackageFullName) : $($shortName)" -fore yellow
						$keyToRemove = "HKCU:\SOFTWARE\Classes\$($shortName)"
						if ($keyToRemove.length -gt 1) {
							Remove-Item -Path "$($keyToRemove)" -Recurse
							Write-Host "[$($keyToRemove)] removed from registry" -fore yellow
						}
					}
				}
			}
		}
	}
	
	$registryItems = Get-ChildItem -Path "HKCU:\SOFTWARE\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages\"
	Foreach ($application In $applications) {
		Foreach ($registryItem In $registryItems) {
			$keyToRemove = $registryItem.Name -replace "HKEY_CURRENT_USER", "HKCU:"
			$splitArray = $keyToRemove -split '\\'
			$itemName = $splitArray[-1]
			$badPackageNamePattern = "$($application)-$($environment)*"

			if ((Test-Path $keyToRemove) -And ("$($itemName)" -like "$($badPackageNamePattern)")) {
				Remove-Item -Path "$($keyToRemove)" -Recurse
				Write-Host "[$($keyToRemove)] removed from registry"
			}
		}
	}
}

$applications = @(
	#"OctavSolutions" # FAIT
	#"PrevoirProtectionSenior",
	#"SolutionCapitalObseques",
	#"SolutionMaintienAutonomie",
	#"SolutionSanteTns", # FAIT
	#"SolutionRetraite",
	#"SolutionSante",
	#"SolutionCoupsDurs",
	#"SolutionPlanEpargneRetraite",
	#"SolutionPrestationObseques",
	#"SolutionPrevoyanceFamiliale",
	"SolutionPrevoyanceTNS"
	#"SolutionEpargneVie"
)

$environments = @(
	$Environment
)

Foreach ($environment in $environments) {
	ProcessEnvironment -applications $applications -environment "$($environment)"
}

Write-Host "Script terminated"
