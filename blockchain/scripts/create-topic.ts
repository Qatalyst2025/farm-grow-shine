import { TopicCreateTransaction } from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "../src/services/hedera.client";

dotenv.config();

async function createTopic() {
  const client = getHederaClient();

  console.log("🧱 Creating new HCS topic...");

  const tx = await new TopicCreateTransaction()
    .setTopicMemo("AgriCrop Audit Logs")
    .execute(client);

  const receipt = await tx.getReceipt(client);
  const topicId = receipt.topicId?.toString();

  console.log("✅ Topic Created! ID:", topicId);
  return topicId;
}

createTopic().catch((err) => console.error("❌ Error creating topic:", err));
