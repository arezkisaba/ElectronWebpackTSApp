import { ExpectedProduct } from "../models/ExpectedProduct";
import { InstalledProduct } from "../models/InstalledProduct";

class BridgeService {
    async getExpectedProducts() : Promise<ExpectedProduct[]> {
        const configFilePath = "C:/git/ElectronWebpackTSApp/src/scripts/config/Production.csv";
        const configFileCsv = await window.electron.readFile(configFilePath);
        const configRecords = await window.electron.getExpectedProducts(configFileCsv);
        return configRecords;
    }

    async getInstalledProducts() : Promise<InstalledProduct[]> {
        const installedProductsCsv = await window.electron.executePowerShell(
            "C:/git/ElectronWebpackTSApp/src/scripts/GetInstalledProducts.ps1",
            ["-environment", "Production"]
        );
        const installedProducts = await window.electron.getInstalledProducts(installedProductsCsv);
        return installedProducts;
    }

    async isProtocolOk(configRecord : ExpectedProduct) : Promise<boolean> {
        const isProtocolOk = await window.electron.executePowerShell(
            "C:/git/ElectronWebpackTSApp/src/scripts/IsProtocolOk.ps1",
            ["-appName", configRecord.Name, "-protocol", configRecord.Protocol]
        );
        return isProtocolOk.trim().toLocaleLowerCase() == "true";
    }

    async isBristolRunning(configRecord : ExpectedProduct) : Promise<boolean> {
        const isBristolRunning = await window.electron.executePowerShell(
            "C:/git/ElectronWebpackTSApp/src/scripts/IsBristolRunning.ps1",
            ["-appName", configRecord.Name]
        );
        return  isBristolRunning.trim().toLocaleLowerCase() == "true";
    }
}

export default BridgeService;