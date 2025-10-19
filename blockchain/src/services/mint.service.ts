import {
  TokenMintTransaction,
  PrivateKey,
  TokenId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "./hedera.client";
import { sendAuditLog } from "../../scripts/send-message";

dotenv.config();

export async function mintToken() {
  const client = getHederaClient();

  const tokenId = TokenId.fromString(process.env.HEDERA_TOKEN_ID!);
  const supplyKey = PrivateKey.fromString(process.env.HEDERA_SUPPLY_KEY!);
  
  const tx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount)
    .freezeWith(client);

  // Mint additional tokens
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(500) // mint 500 more
    .freezeWith(client);

  const signTx = await mintTx.sign(supplyKey);
  const submitTx = await signTx.execute(client);
  const receipt = await submitTx.getReceipt(client);
  
  const newTotal = receipt.totalSupply?.toString();
  console.log(`✅ Mint successful! Total Supply: ${newTotal}`);
  
  await sendAuditLog("TOKEN_MINT", {
    tokenId: tokenId.toString(),
    amount,
    totalSupply: newTotal,
  });

  return newTotal;
  }

  console.log("✅ Mint successful!");
  console.log("Total Supply:", receipt.totalSupply?.toString());
}

mintToken().catch((err) => console.error("❌ Minting failed:", err));

