"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHederaClient = getHederaClient;
const sdk_1 = require("@hashgraph/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getHederaClient() {
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY?.trim();
    const network = process.env.HEDERA_NETWORK || "testnet";
    if (!accountId || !privateKey) {
        throw new Error("❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
    }
    let operatorKey;
    let keyType;
    try {
        if (privateKey.startsWith("0x")) {
            operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
            keyType = "ECDSA (0x prefixed)";
        }
        else if (privateKey.startsWith("302e")) {
            operatorKey = sdk_1.PrivateKey.fromStringED25519(privateKey);
            keyType = "ED25519 (DER encoded)";
        }
        else if (privateKey.includes(" ")) {
            operatorKey = sdk_1.PrivateKey.fromString(privateKey);
            keyType = "auto-detected";
        }
        else {
            operatorKey = sdk_1.PrivateKey.fromString(privateKey);
            keyType = "auto-detected";
        }
    }
    catch (err) {
        console.error("❌ Failed to parse Hedera private key:", err.message);
        throw new Error("❌ Invalid HEDERA_PRIVATE_KEY format — please check your .env");
    }
    const operatorId = sdk_1.AccountId.fromString(accountId);
    let client;
    switch (network) {
        case "mainnet":
            client = sdk_1.Client.forMainnet();
            break;
        case "previewnet":
            client = sdk_1.Client.forPreviewnet();
            break;
        default:
            client = sdk_1.Client.forTestnet();
    }
    client.setOperator(operatorId, operatorKey);
    console.log(`🌐 Connected to ${network} as ${operatorId.toString()}`);
    console.log(`🔑 Using ${keyType} private key`);
    return client;
}
//# sourceMappingURL=hedera.client.js.map