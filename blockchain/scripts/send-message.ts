import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "../src/services/hedera.client";

dotenv.config();

export async function sendAuditLog(event: string, details: object) {
  const client = getHederaClient();
  const topicId = process.env.HEDERA_TOPIC_ID!;

  const message = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`📤 Log sent to topic ${topicId}: ${event}`);
  return receipt;
}
