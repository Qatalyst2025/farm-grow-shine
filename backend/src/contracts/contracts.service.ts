import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { getHederaClient } from '../../../blockchain/src/services/hedera.client';
import {
  AccountId,
  ContractCallQuery,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCreateTransaction,
  Hbar,
  PrivateKey,
  ContractByteCodeQuery,
  ContractId,
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

    // ✅ Use the creation bytecode, NOT deployedBytecode
    const bytecode = contractJson.bytecode.object;

    if (!bytecode || typeof bytecode !== 'string' || !bytecode.startsWith('0x')) {
      throw new Error('❌ Invalid bytecode format. Must start with 0x.');
    }

    console.log('🔍 Bytecode length:', bytecode.length);
    console.log('🔍 Bytecode starts with:', bytecode.substring(0, 50));

    // ✅ Convert hex bytecode string to Buffer
    const bytecodeBuffer = Buffer.from(bytecode.slice(2), 'hex');

    if (bytecodeBuffer.length < 100) {
      throw new Error('❌ Bytecode too short — likely not raw EVM bytecode.');
    }

    // ✅ Use ContractCreateTransaction instead of ContractCreateFlow
    const contractTx = new ContractCreateTransaction()
      .setBytecode(bytecodeBuffer)
      .setGas(2_000_000) // Increased gas limit
      .setAdminKey(operatorKey);

    console.log('🚀 Deploying contract...');
  
    // Freeze, sign and execute the transaction
    const frozenTx = await contractTx.freezeWith(client);
    const signTx = await frozenTx.sign(operatorKey);
    const contractResponse = await signTx.execute(client);
    const receipt = await contractResponse.getReceipt(client);
    const contractId = receipt.contractId?.toString();

    if (!contractId) {
      console.error('❌ Contract deployment failed. Receipt status:', receipt.status.toString());
      throw new Error('❌ Contract deployment failed.');
    }

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
  
  async verifyContract(contractId: string) {
    const client = getHederaClient();

    console.log(`🔍 Verifying contract ${contractId}...`);

    const onChainBytecode = await new ContractByteCodeQuery()
      .setContractId(ContractId.fromString(contractId))
      .execute(client);

    // 2️⃣ Get local build artifact (from Foundry output)
    const artifactPath = path.resolve(
      __dirname,
      "../src/blockchain/contracts-foundry/out/SimpleStorage.sol/SimpleStorage.json"
      // /home/abel/Desktop/hedera/backend/src/blockchain/contracts-foundry/out/SimpleStorage.sol/
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`❌ Artifact not found at ${artifactPath}`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const localBytecode = artifact.bytecode?.object || artifact.bytecode;

    const isMatch = onChainBytecode.toString("hex") === localBytecode.replace(/^0x/, "");

    console.log(isMatch ? "✅ Bytecode verified!" : "❌ Bytecode mismatch!");

    return {
      contractId,
      verified: isMatch,
      onChainBytecodeLength: onChainBytecode.length,
      localBytecodeLength: localBytecode.length / 2,
    };
  }
}

