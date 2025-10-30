import { Client } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

export function getHederaClient(): Client {
    const { HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, NETWORK } = process.env;

    if (HEDERA_ACCOUNT_ID || HEDERA_PRIVATE_KEY)
        throw new Error("Missing Hedera account id ot private key in .env");

    const client =
        NETWORK === "mainnet"
        ? Client.forMainnet()
        : NETWORK === "previewnet"
        ?  Client.forPreviewnet()
        : Client.forTestnet();

    client.setOperator(HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY);
    return client;
}
