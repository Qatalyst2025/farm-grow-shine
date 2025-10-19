import { TransferTransaction, PrivateKey, AccountId, TokenId } from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "./hedera.client";

dotenv.config();

export async function transferToken(tokenId: string, senderId: string, senderKeyStr: string, receiverId: string, amount: number) {
  const client = getHederaClient();

  try {
    const senderKey = PrivateKey.fromString(senderKeyStr);

    const tx = await new TransferTransaction()
      .addTokenTransfer(tokenId, AccountId.fromString(senderId), -amount)
      .addTokenTransfer(tokenId, AccountId.fromString(receiverId), amount)
      .freezeWith(client)
      .sign(senderKey);

    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log(`💸 Transferred ${amount} of ${tokenId} from ${senderId} → ${receiverId}`);
    console.log("✅ Status:", receipt.status.toString());
  } catch (err) {
    console.error("❌ Transfer failed:", err);
  }
}

