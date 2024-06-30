param (
	[string]$CsvFilePath = ".\Production.csv",
	[switch]$Show
)

function GetInstalledProtocol {
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

		if (($itemName -like "$($appName)*") -ANd (Test-Path $keyFormatted)) {
			try {
				Get-ItemPropertyValue -Path "$($packageRegistryKey)" -Name "$($protocol)" > $null
				return $protocol
			}
			catch {
				return $null
			}
		}
	}

	return $null
}

function IsBristolRunning {
	param(
		[string]$appName
	)

	$appCommonName = $appName.Replace("Prevoir.", "").Split("-")[0]
	$bristolName = "Prevoir.$($appCommonName).Bristol"							
	$process = (Get-Process "$($bristolName)" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "C:\Program Files\Groupe Prévoir\$($appName)*\$($bristolName).exe" })
	return $null -ne $process
}

function FillListBoxWithPTCComponentsInfos {
	param(
		[System.Windows.Forms.ListBox]$listBox
	)

	if (!(Test-Path "$($CsvFilePath)")) {
		$a = new-object -comobject wscript.shell
		$a.popup("Le fichier de référence est inaccessible, veuillez vérifier votre connexion au Groupe Prévoir.", 0, "OCTAV Check Products")
		exit
	}

	$csvRows = Import-Csv "$($CsvFilePath)"
	Write-Host "Le chemin du fichier CSV est $($CsvFilePath)"
	Write-Host "Le nombre d applications est $($csvRows.Count)"

	$amount = $csvRows.Count
	$loaderUiResult = BuildLoaderUI -progressbarMax $amount
	$objForm = $loaderUiResult[0]
	$progressbar = $loaderUiResult[1]
	$listBox.Items.Clear()

	$productItems = GetProductItems -environment "Production"

	while ($i -le $amount) {
		foreach ($csvRow in $csvRows) {
			$name = $csvRow.Name
			$expectedVersion = $csvRow.Version
			$expectedHasUI = $csvRow.HasUI
			$expectedProtocol = $csvRow.Protocol
			
			$registryProductItem = $productItems | Where-Object -Property PackageName -eq "$($name)"			
			$installedProductVersion = $registryProductItem.PackageVersion
			$installedUWPVersion = Get-AppxPackage | Where-Object { $_.name -eq $name } | Select-Object -ExpandProperty Version
			$bristolRunning = IsBristolRunning -appName "$($name)"
			$installedProtocol = GetInstalledProtocol -appName "$($name)" -protocol "$($expectedProtocol)"

			Write-Host "**********************"
			Write-Host "Nom de l'application: $($name)"
			Write-Host "expectedVersion: $($expectedVersion)"
			Write-Host "installedProductVersion: $($installedProductVersion)"
			Write-Host "installedUWPVersion: $($installedUWPVersion)"
			Write-Host "expectedHasUI: $($expectedHasUI)"
			Write-Host "expectedProtocol: $($expectedProtocol)"
			Write-Host "installedProtocol: $($installedProtocol)"
			Write-Host "bristolRunning: $($bristolRunning)"

			$isUwpVersionOk = ($expectedHasUI -eq "False") -Or ($expectedVersion -eq $installedUWPVersion)
			$isVersionOk = ($expectedVersion -eq $installedProductVersion) -And $isUwpVersionOk
			$isProtocolOk = ($expectedHasUI -eq "False") -Or ($null -ne $expectedProtocol)

			if ($isVersionOk -And $isProtocolOk) {
				[void]$listBox.Items.Add("$($name) est OK")
			} else {
				[void]$listBox.Items.Add("$($name) est KO")
			}

			$progressbar.Value = $i
			$i++
			$objForm.Add_Shown({ $objForm.Activate() })
			$Form = $objForm.Show()
		}

		for ($i = 1; $i -le $amount; $i++) {}
		$Form = $objForm.Close()
		$objForm.Dispose()
	}
}

function GetProductItems {
	param(
		[string]$environment
	)
	
	$productItems = @()
	$packageRegistryItems = Get-ChildItem -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
	foreach ($packageRegistryItem in $packageRegistryItems) {
		$path = $packageRegistryItem.Name -replace "HKEY_LOCAL_MACHINE", "HKLM:"
		if ($path -like "*.sdb" -Or $path -like "* *") {
			continue
		}

		$key = Get-Item -LiteralPath $path -ErrorAction SilentlyContinue
		$propertyExists = $key -and $null -ne $key.GetValue("DisplayName", $null)
		if (-not $propertyExists) {
			continue
		}

		$packageName = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayName" -ErrorAction SilentlyContinue
		$packageVersion = Get-ItemPropertyValue -Path "$($path)" -Name "DisplayVersion" -ErrorAction SilentlyContinue
		if ($packageName -And $packageName -like "*$($environment)") {
			$productItem = [PSCustomObject]@{
				PackageName = $packageName
				PackageVersion = $packageVersion
			}
			$productItems += $productItem
		}
	}

	return $productItems
}

function Main {
	ImportDlls
	ToggleConsole

	$resultTuple = BuildMainUI
	$listForm = $resultTuple[0]
	$listBox =  $resultTuple[1]

	FillListBoxWithPTCComponentsInfos -listBox $listBox
	$result = $listForm.ShowDialog()

	$canExit = $false
	while (-not $canExit) {
		if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
			FillListBoxWithPTCComponentsInfos -listBox $listBox
			$result = $listForm.ShowDialog()
		} elseif ($result -eq [System.Windows.Forms.DialogResult]::Cancel) {
			$canExit = $true
			exit
		}
	}
}

Main
