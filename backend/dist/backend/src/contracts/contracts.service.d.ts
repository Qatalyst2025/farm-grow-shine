import { DbService } from '../db/db.service';
export declare class ContractsService {
    private readonly db;
    constructor(db: DbService);
    deployContract(): Promise<{
        contractId: string;
    }>;
    callContractFunction(contractId: string, func: string, params?: any[]): Promise<{
        status: string;
    }>;
    queryContractValue(contractId: string, func: string, params?: any[]): Promise<{
        value: any;
    }>;
}
