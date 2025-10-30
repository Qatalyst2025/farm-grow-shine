import { PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!privateKey) {
  console.error("❌ Missing HEDERA_PRIVATE_KEY in .env");
  process.exit(1);
}

try {
  const key = PrivateKey.fromString(privateKey.trim());
  console.log("✅ Hedera private key is valid.");

  // Detect key type manually based on prefix
  let keyType: string;

  if (privateKey.startsWith("0x")) {
    keyType = "ECDSA (hex format)";
  } else if (privateKey.startsWith("302e02")) {
    keyType = "DER-encoded ED25519";
  } else if (privateKey.length > 80) {
    keyType = "ED25519 (Hedera format)";
  } else {
    keyType = "Unknown format";
  }

  console.log(`🔑 Key type detected: ${keyType}`);
} catch (e: any) {
  console.error("❌ Invalid key:", e.message);
}
