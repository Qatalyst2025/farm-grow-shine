"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
const hedera_client_1 = require("../../../blockchain/src/services/hedera.client");
const sdk_1 = require("@hashgraph/sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const schema_1 = require("../db/schema");
let ContractsService = class ContractsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async deployContract() {
        const client = (0, hedera_client_1.getHederaClient)();
        const operatorKey = sdk_1.PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
        const operatorId = sdk_1.AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
        const contractPath = path_1.default.resolve('src/contracts/example/build/SimpleStorage.json');
        const contractJson = JSON.parse(fs_1.default.readFileSync(contractPath, 'utf8'));
        const bytecode = contractJson.bytecode?.object || contractJson.bytecode || '';
        if (!bytecode || typeof bytecode !== 'string') {
            throw new Error('❌ Invalid contract bytecode format.');
        }
        const bytecodeBuffer = Buffer.from(bytecode.replace(/^0x/, ''), 'hex');
        const contractTx = new sdk_1.ContractCreateFlow()
            .setBytecode(bytecodeBuffer)
            .setGas(200_000)
            .setAdminKey(operatorKey)
            .setInitialBalance(new sdk_1.Hbar(5));
        const contractResponse = await contractTx.execute(client);
        const receipt = await contractResponse.getReceipt(client);
        const contractId = receipt.contractId?.toString();
        if (!contractId)
            throw new Error('❌ Contract deployment failed.');
        console.log('✅ Contract deployed successfully:', contractId);
        await this.db.db.insert(schema_1.transactions).values({
            userId: 1,
            txHash: contractId,
            type: 'DEPLOY_CONTRACT',
            status: 'success',
        });
        return { contractId };
    }
    async callContractFunction(contractId, func, params = []) {
        const client = (0, hedera_client_1.getHederaClient)();
        const operatorKey = sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
        const functionParams = new sdk_1.ContractFunctionParameters();
        for (const param of params) {
            if (typeof param === 'number')
                functionParams.addUint256(param);
            else if (typeof param === 'string')
                functionParams.addString(param);
            else
                throw new Error(`Unsupported parameter type: ${typeof param}`);
        }
        const tx = new sdk_1.ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(200_000)
            .setFunction(func, functionParams)
            .freezeWith(client);
        const signTx = await tx.sign(operatorKey);
        const submitTx = await signTx.execute(client);
        const receipt = await submitTx.getReceipt(client);
        console.log(`✅ Executed ${func} on ${contractId}, Status: ${receipt.status.toString()}`);
        return { status: receipt.status.toString() };
    }
    async queryContractValue(contractId, func, params = []) {
        const client = (0, hedera_client_1.getHederaClient)();
        const functionParams = new sdk_1.ContractFunctionParameters();
        for (const param of params) {
            if (typeof param === 'number')
                functionParams.addUint256(param);
            else if (typeof param === 'string')
                functionParams.addString(param);
        }
        const query = new sdk_1.ContractCallQuery()
            .setContractId(contractId)
            .setGas(100_000)
            .setFunction(func, functionParams);
        const result = await query.execute(client);
        const value = result.getUint256(0).toString();
        console.log(`📊 Query Result from ${func}:`, value);
        return { value };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map