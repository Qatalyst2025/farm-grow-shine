import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    deploy(): Promise<{
        contractId: string;
    }>;
    call(body: {
        contractId: string;
        func: string;
        params: any[];
    }): Promise<{
        status: string;
    }>;
    read(id: string, func: string): Promise<{
        value: any;
    }>;
}
