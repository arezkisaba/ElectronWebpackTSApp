import { InstalledProduct } from "../models/InstalledProduct";
import { ExpectedProduct } from "../models/ExpectedProduct";

export interface IElectronAPI {
    readFile: (filePath: string) => Promise<string>;
    getExpectedProducts: (content: string) => Promise<ExpectedProduct[]>;
    getInstalledProducts: (content: string) => Promise<InstalledProduct[]>;
    executePowerShell: (scriptPath: string, args: string[]) => Promise<string>;
    platform: string;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}