import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

export function getHederaClient(): Client {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY?.trim();
  const network = process.env.HEDERA_NETWORK || "testnet";

  if (!accountId || !privateKey) {
    throw new Error("❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
  }

  let operatorKey: PrivateKey;
  let keyType: string;

  try {
    // Detect automatically based on content
    if (privateKey.startsWith("0x")) {
      operatorKey = PrivateKey.fromStringECDSA(privateKey);
      keyType = "ECDSA (0x prefixed)";
    } else if (privateKey.startsWith("302e")) {
      operatorKey = PrivateKey.fromStringED25519(privateKey);
      keyType = "ED25519 (DER encoded)";
    } else if (privateKey.includes(" ")) {
      operatorKey = PrivateKey.fromString(privateKey); // supports “302e…” and mnemonic formats
      keyType = "auto-detected";
    } else {
      // fallback
      operatorKey = PrivateKey.fromString(privateKey);
      keyType = "auto-detected";
    }
  } catch (err) {
    console.error("❌ Failed to parse Hedera private key:", err.message);
    throw new Error("❌ Invalid HEDERA_PRIVATE_KEY format — please check your .env");
  }

  const operatorId = AccountId.fromString(accountId);

  let client: Client;
  switch (network) {
    case "mainnet":
      client = Client.forMainnet();
      break;
    case "previewnet":
      client = Client.forPreviewnet();
      break;
    default:
      client = Client.forTestnet();
  }

  client.setOperator(operatorId, operatorKey);
  console.log(`🌐 Connected to ${network} as ${operatorId.toString()}`);
  console.log(`🔑 Using ${keyType} private key`);
  return client;
}

