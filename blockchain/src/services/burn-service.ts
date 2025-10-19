import { TokenBurnTransaction, PrivateKey, TokenId } from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "./hedera.client";

dotenv.config();

export async function burnToken(tokenId: string, amount: number, supplyKeyString: string) {
  const client = getHederaClient();

  try {
    const supplyKey = PrivateKey.fromString(supplyKeyString);
    const token = TokenId.fromString(tokenId);

    const tx = await new TokenBurnTransaction()
      .setTokenId(token)
      .setAmount(amount)
      .freezeWith(client)
      .sign(supplyKey);

    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log(`🔥 Burned ${amount} tokens from ${tokenId}`);
    console.log("✅ Status:", receipt.status.toString());
  } catch (err) {
    console.error("❌ Burn failed:", err);
  }
}

