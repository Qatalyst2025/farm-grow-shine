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
  TransactionRecordQuery,
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
  const operatorKey = PrivateKey.fromStringECDSA(
    process.env.HEDERA_PRIVATE_KEY!,
  );
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);

  // ✅ Use the CORRECT Foundry output path
  const contractPath = path.join(
    process.cwd(),
    'src/blockchain/contracts-foundry/out/SimpleStorage.sol/SimpleStorage.json'
  );

  console.log('🔍 Contract path:', contractPath);
  console.log('🔍 File exists:', fs.existsSync(contractPath));

  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // ✅ Use the creation bytecode, NOT deployedBytecode
  const bytecode = contractJson.bytecode.object;

  if (
    !bytecode ||
    typeof bytecode !== 'string' ||
    !bytecode.startsWith('0x')
  ) {
    throw new Error('❌ Invalid bytecode format. Must start with 0x.');
  }

  console.log('🔍 Bytecode length:', bytecode.length);
  console.log('🔍 Bytecode starts with:', bytecode.substring(0, 50));

  // ✅ Debug: Check if updateGrowth exists in ABI
  const hasUpdateGrowth = contractJson.abi.some((item: any) => item.name === 'updateGrowth');
  console.log('🔍 Contract has updateGrowth function:', hasUpdateGrowth);
  
  if (!hasUpdateGrowth) {
    console.log('❌ WARNING: Contract does not have updateGrowth function!');
    console.log('🔍 Available functions:');
    contractJson.abi.forEach((item: any) => {
      if (item.type === 'function') {
      console.log(`  - ${item.name}`);
      }
    });
  }

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
    console.error(
      '❌ Contract deployment failed. Receipt status:',
      receipt.status.toString(),
    );
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
  async callContractFunction(
  contractId: string,
  func: string,
  params: any[] = [],
) {
  const client = getHederaClient();
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

  console.log(`\n📞 Calling ${func} on ${contractId}`);
  console.log('📋 Raw params:', params);
  console.log('🔍 Param types:', params.map(p => `${typeof p}: ${p}`));

  try {
    const functionParams = new ContractFunctionParameters();
    
    // Enhanced parameter processing with detailed logging
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      console.log(`➡️ Processing param ${i}:`, param, `Type:`, typeof param);
      
      if (typeof param === 'number') {
        // Ensure it's an integer for uint256
        const intValue = Math.floor(param);
        console.log(`   → Adding as uint256: ${intValue}`);
        functionParams.addUint256(intValue);
      } else if (typeof param === 'string') {
        console.log(`   → Adding as string: "${param}"`);
        functionParams.addString(param);
      } else if (typeof param === 'boolean') {
        console.log(`   → Adding as bool: ${param}`);
        functionParams.addBool(param);
      } else {
        throw new Error(`Unsupported parameter type at index ${i}: ${typeof param}`);
      }
    }

    console.log(`⚡ Executing contract call with ${params.length} parameters...`);

    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(contractId))
      .setGas(1_000_000)
      .setFunction(func, functionParams)
      .freezeWith(client);

    console.log(`❄️ Transaction frozen, signing...`);

    const signTx = await tx.sign(operatorKey);
    const submitTx = await signTx.execute(client);
    
    console.log(`📤 Transaction submitted: ${submitTx.transactionId.toString()}`);
    console.log(`⏳ Waiting for receipt...`);

    const receipt = await submitTx.getReceipt(client);
    
    console.log(`📄 Receipt status: ${receipt.status.toString()}`);

    if (receipt.status.toString() !== 'SUCCESS') {
      // Try to get more detailed error information
      try {
        const record = await new TransactionRecordQuery()
          .setTransactionId(submitTx.transactionId)
          .execute(client);
        console.log(`🔍 Transaction record:`, record);
      } catch (recordError) {
        console.log(`⚠️ Could not fetch transaction record:`, recordError.message);
      }
      
      throw new Error(
        `Contract call failed with status: ${receipt.status.toString()}`
      );
    }

    console.log(
      `✅ Successfully executed ${func} on ${contractId}`
    );
    
    return { 
      status: receipt.status.toString(),
      transactionId: submitTx.transactionId.toString()
    };
  } catch (error) {
    console.error(
      `❌ Failed to execute ${func} on ${contractId}:`,
      error.message
    );
    console.error(`🔍 Stack trace:`, error.stack);
    
    // More specific error handling
    if (error.message.includes('CONTRACT_REVERT_EXECUTED')) {
      console.error(`💡 The contract reverted. Possible causes:`);
      console.error(`   - Invalid parameters or types`);
      console.error(`   - Require condition failed in contract`);
      console.error(`   - Access control restriction`);
      console.error(`   - Insufficient gas`);
    }
    
    throw new Error(`Contract call failed: ${error.message}`);
  }
}
  /**
   * Query contract view function (non-state changing)
   */
  async queryContractValue(
    contractId: string,
    func: string,
    params: any[] = [],
  ) {
    const client = getHederaClient();

    console.log(`📊 Querying ${func} on ${contractId} with params:`, params);

    try {
      const functionParams = new ContractFunctionParameters();
      for (const param of params) {
        if (typeof param === 'number') functionParams.addUint256(param);
        else if (typeof param === 'string') functionParams.addString(param);
      }

      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(200_000)
        .setFunction(func, functionParams);

      const result = await query.execute(client);

      // Handle different return types safely
      let value;
      try {
        value = result.getUint256(0)?.toString();
      } catch (e) {
        try {
          value = result.getString(0);
        } catch (e2) {
          value = 'Unable to decode return value';
        }
      }

      console.log(`📊 Query Result from ${func}:`, value);

      return { value };
    } catch (error) {
      console.error(
        `❌ Failed to query ${func} on ${contractId}:`,
        error.message,
      );
      throw new Error(`Contract query failed: ${error.message}`);
    }
  }

  async verifyContract(contractId: string) {
    const client = getHederaClient();
    console.log(`🔍 Verifying contract ${contractId}...`);

    const onChainBytecode = await new ContractByteCodeQuery()
      .setContractId(ContractId.fromString(contractId))
      .execute(client);

    const artifactPath = path.resolve(
      process.cwd(),
      'src/blockchain/contracts-foundry/out/SimpleStorage.sol/SimpleStorage.json',
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`❌ Artifact not found at ${artifactPath}`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const localBytecode = artifact.bytecode?.object || artifact.bytecode;

    const onChainHex = Buffer.from(onChainBytecode).toString('hex');
    const localHex = localBytecode.replace(/^0x/, '');

    const isMatch = onChainHex === localHex;

    console.log(isMatch ? '✅ Bytecode verified!' : '❌ Bytecode mismatch!');

    return {
      contractId: contractId,
      verified: isMatch,
      onChainBytecodeLength: onChainBytecode.length,
      localBytecodeLength: localBytecode.length / 2,
    };
  }
}
