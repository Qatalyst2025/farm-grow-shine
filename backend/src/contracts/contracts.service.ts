import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { getHederaClient } from '../../../blockchain/src/services/hedera.client';
import {
  AccountId,
  ContractCallQuery,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  PrivateKey,
} from '@hashgraph/sdk';
import fs from 'fs';
import path from 'path';
import { transactions } from '../db/schema';

@Injectable()
export class ContractsService {
  constructor(private readonly db: DbService) {}

  /**
   * Deploy a compiled Foundry contract (.json)
   */
  async deployContract() {
    const client = getHederaClient();
    const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);

    // ✅ Load the Foundry build artifact
    const contractPath = path.resolve(
      'src/contracts/example/build/SimpleStorage.json',
    );

    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

    // ✅ Extract proper bytecode format (Foundry uses { object: "0x..." })
    const bytecode =
      contractJson.bytecode?.object || contractJson.bytecode || '';

    if (!bytecode || typeof bytecode !== 'string') {
      throw new Error('❌ Invalid contract bytecode format.');
    }

    // ✅ Convert hex bytecode string to Buffer
    const bytecodeBuffer = Buffer.from(
      bytecode.replace(/^0x/, ''), // remove 0x if exists
      'hex',
    );

    // ✅ Create the contract deployment transaction
    const contractTx = new ContractCreateFlow()
      .setBytecode(bytecodeBuffer)
      .setGas(200_000)
      .setAdminKey(operatorKey)
      .setInitialBalance(new Hbar(5));

    const contractResponse = await contractTx.execute(client);
    const receipt = await contractResponse.getReceipt(client);
    const contractId = receipt.contractId?.toString();

    if (!contractId) throw new Error('❌ Contract deployment failed.');

    console.log('✅ Contract deployed successfully:', contractId);

    // ✅ Save to DB
    await this.db.db.insert(transactions).values({
      userId: 1,
      txHash: contractId,
      type: 'DEPLOY_CONTRACT',
      status: 'success',
    });

    return { contractId };
  }

  /**
   * Call a contract function (state-changing)
   */
  async callContractFunction(contractId: string, func: string, params: any[] = []) {
    const client = getHederaClient();
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

    const functionParams = new ContractFunctionParameters();
    for (const param of params) {
      if (typeof param === 'number') functionParams.addUint256(param);
      else if (typeof param === 'string') functionParams.addString(param);
      else throw new Error(`Unsupported parameter type: ${typeof param}`);
    }

    const tx = new ContractExecuteTransaction()
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

  /**
   * Query contract view function (non-state changing)
   */
  async queryContractValue(contractId: string, func: string, params: any[] = []) {
    const client = getHederaClient();

    const functionParams = new ContractFunctionParameters();
    for (const param of params) {
      if (typeof param === 'number') functionParams.addUint256(param);
      else if (typeof param === 'string') functionParams.addString(param);
    }

    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100_000)
      .setFunction(func, functionParams);

    const result = await query.execute(client);
    const value = result.getUint256(0).toString();

    console.log(`📊 Query Result from ${func}:`, value);

    return { value };
  }
}

