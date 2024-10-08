import ExpectedProduct from "../models/ExpectedProduct";
import InstalledProduct from "../models/InstalledProduct";

export default interface IPowershellPortService {
    getExpectedProducts(): Promise<ExpectedProduct[]>;
    getInstalledProducts(): Promise<InstalledProduct[]>;
    isProtocolOk(configRecord: ExpectedProduct): Promise<boolean>;
    isBristolRunning(configRecord: ExpectedProduct): Promise<boolean>;
}
