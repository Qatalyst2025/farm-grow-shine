import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  PrivateKey,
  AccountId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import { getHederaClient } from "./hedera.client";

dotenv.config();

/**
 * Creates a new fungible token on the Hedera network.
 * Returns both the token ID and the generated supply key.
 */
export async function createToken() {
  try {
    const client = getHederaClient();

    const treasuryId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

    // ✅ Generate a distinct supply key (this key will authorize future mints)
    const supplyKey = PrivateKey.generate();

    const tx = new TokenCreateTransaction()
      .setTokenName("AgriCrop Token")
      .setTokenSymbol("AGC")
      .setDecimals(2)
      .setInitialSupply(1000)
      .setTreasuryAccountId(treasuryId)
      .setAdminKey(treasuryKey.publicKey)
      .setSupplyKey(supplyKey.publicKey) // ✅ allows minting later
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    // Sign with treasury key
    const signTx = await tx.sign(treasuryKey);
    const submitTx = await signTx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    const tokenId = receipt.tokenId?.toString();
    console.log("✅ Token Created Successfully!");
    console.log("🆔 Token ID:", tokenId);
    console.log("🔑 Supply Key (save securely):", supplyKey.toStringDer());
    console.log("🔒 Public Key:", supplyKey.publicKey.toStringDer());

    return {
      tokenId,
      supplyKey: supplyKey.toStringDer(),
    };
  } catch (error) {
    console.error("❌ Token creation failed:", error);
    throw error;
  }
}

