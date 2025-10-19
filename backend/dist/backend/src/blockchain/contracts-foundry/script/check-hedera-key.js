"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@hashgraph/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const privateKey = process.env.HEDERA_PRIVATE_KEY;
if (!privateKey) {
    console.error("❌ Missing HEDERA_PRIVATE_KEY in .env");
    process.exit(1);
}
try {
    const key = sdk_1.PrivateKey.fromString(privateKey.trim());
    console.log("✅ Hedera private key is valid.");
    let keyType;
    if (privateKey.startsWith("0x")) {
        keyType = "ECDSA (hex format)";
    }
    else if (privateKey.startsWith("302e02")) {
        keyType = "DER-encoded ED25519";
    }
    else if (privateKey.length > 80) {
        keyType = "ED25519 (Hedera format)";
    }
    else {
        keyType = "Unknown format";
    }
    console.log(`🔑 Key type detected: ${keyType}`);
}
catch (e) {
    console.error("❌ Invalid key:", e.message);
}
//# sourceMappingURL=check-hedera-key.js.map