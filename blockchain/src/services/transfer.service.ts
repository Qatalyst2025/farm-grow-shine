import {
  TokenAssociateTransaction,
  TransferTransaction,
  PrivateKey,
  Hbar,
  AccountId,
} from "@hashgraph/sdk";
import { getHederaClient } from "./hedera.client";

export async function transferToken(
  tokenId: string,
  toAccountId: string,
  amount: number
) {
  const client = getHederaClient();
  const treasuryId = process.env.HEDERA_ACCOUNT_ID!;
  const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

  // Associate the token with the receiver first (required once)
  const associateTx = await new TokenAssociateTransaction()
    .setAccountId(toAccountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(treasuryKey);
  await associateTx.execute(client);

  // Transfer tokens
  const transferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, treasuryId, -amount)
    .addTokenTransfer(tokenId, toAccountId, amount)
    .setMaxTransactionFee(new Hbar(5))
    .freezeWith(client)
    .sign(treasuryKey);

  const submitTx = await transferTx.execute(client);
  const receipt = await submitTx.getReceipt(client);

  console.log(`✅ Transferred ${amount} of ${tokenId} to ${toAccountId}`);
  return receipt.status.toString();
}
