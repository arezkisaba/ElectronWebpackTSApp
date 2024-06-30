param (
	[string]$CsvFilePath = ".\Production.csv",
	[switch]$Show
)

function ImportDlls {
	Add-Type -Name Window -Namespace Console -MemberDefinition '
	[DllImport("Kernel32.dll")]
	public static extern IntPtr GetConsoleWindow();
	
	[DllImport("user32.dll")]
	public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
	'
}

function ShowConsole {
	$consolePtr = [Console.Window]::GetConsoleWindow()

	# Hide = 0,
	# ShowNormal = 1,
	# ShowMinimized = 2,
	# ShowMaximized = 3,
	# Maximize = 3,
	# ShowNormalNoActivate = 4,
	# Show = 5,
	# Minimize = 6,
	# ShowMinNoActivate = 7,
	# ShowNoActivate = 8,
	# Restore = 9,
	# ShowDefault = 10,
	# ForceMinimized = 11

	[Console.Window]::ShowWindow($consolePtr, 4)
}

function HideConsole {
	$consolePtr = [Console.Window]::GetConsoleWindow()
	#0 hide
	[Console.Window]::ShowWindow($consolePtr, 0)
}

function ToggleConsole {
	If ($Show) {
		Write-Host "Console mode => Visible"
		ShowConsole
	} else {
		Write-Host "Console mode => Collapsed"
		HideConsole
	}
}

function BuildMainUI {
	Add-Type -AssemblyName System.Windows.Forms
	Add-Type -AssemblyName System.Drawing

	$ListForm = New-Object System.Windows.Forms.Form
	$ListForm.Text = "OCTAV Check Products"
	$ListForm.Size = New-Object System.Drawing.Size(650, 750)
	$ListForm.StartPosition = "CenterScreen"

	$FormLabel = New-Object System.Windows.Forms.Label
	$FormLabel.Location = New-Object System.Drawing.Point(10, 20)
	$FormLabel.Size = New-Object System.Drawing.Size(280, 20)
	$FormLabel.Text = "Vérification des applications : "

	$ListBox = New-Object System.Windows.Forms.ListBox
	$ListBox.Location = New-Object System.Drawing.Size(10, 40) 
	$ListBox.Size = New-Object System.Drawing.Size(610, 20) 
	$ListBox.Height = 550
	$ListBox.Font = New-Object System.Drawing.Font("Calibri", 17, [System.Drawing.FontStyle]::Regular)

	$ButtonRefresh = New-Object System.Windows.Forms.Button
	$ButtonRefresh.Location = New-Object System.Drawing.Point(230, 640)
	$ButtonRefresh.Size = New-Object System.Drawing.Size(95, 43)
	$ButtonRefresh.Text = "Rafraichir"
	$ButtonRefresh.DialogResult = [System.Windows.Forms.DialogResult]::OK

	$ButtonClose = New-Object System.Windows.Forms.Button
	$ButtonClose.Location = New-Object System.Drawing.Point(325, 640)
	$ButtonClose.Size = New-Object System.Drawing.Size(95, 43)
	$ButtonClose.Text = "Fermer"
	$ButtonClose.DialogResult = [System.Windows.Forms.DialogResult]::Cancel

	$ListForm.Controls.Add($ButtonRefresh) 
	$ListForm.Controls.Add($ButtonClose)
	$ListForm.Controls.Add($FormLabel) 
	$ListForm.Controls.Add($ListBox)

	$ListForm.TopMost = $True

	$ListForm.Add_Shown({ $ListForm.Activate() })
	
    return , $ListForm, $ListBox
}

function BuildLoaderUI {
	param(
		[int]$progressbarMax
	)

	[void][system.reflection.assembly]::LoadWithPartialName("System.Drawing")
	[void][System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")

	$loaderForm = New-Object System.Windows.Forms.Form
	$loaderForm.Text = "Scan in Progress..."
	$loaderForm.Size = New-Object System.Drawing.Size(400, 200)
	$loaderForm.FormBorderStyle = 'Fixed3D'
	$loaderForm.MaximizeBox = $false
	$loaderForm.MinimizeBox = $false
	$loaderForm.StartPosition = "CenterScreen"

	$loaderProgressbar = New-Object System.Windows.Forms.ProgressBar
	$loaderProgressbar.Minimum = 0
	$loaderProgressbar.Maximum = $progressbarMax
	$loaderProgressbar.Location = new-object System.Drawing.Size(10, 80)
	$loaderProgressbar.size = new-object System.Drawing.Size(300, 20)
	$loaderForm.Controls.Add($loaderProgressbar)

	return , $loaderForm, $loaderProgressbar
}

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

function Test-RegistryValue($path, $name) {
    $key = Get-Item -LiteralPath $path -ErrorAction SilentlyContinue
    $key -and $null -ne $key.GetValue($name, $null)
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

		$propertyExists = Test-RegistryValue "$($path)" "DisplayName"
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
