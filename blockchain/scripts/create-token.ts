import { createToken } from "../src/services/token.service";

(async () => {
  try {
    const { tokenId, supplyKey } = await createToken();
    console.log("\n✅ Token created successfully!");
    console.log("🆔 Token ID:", tokenId);
    console.log("🔑 Supply Key:", supplyKey);
    console.log("\n⚠️  Save this supply key securely — you'll need it for minting!");
  } catch (err) {
    console.error("❌ Error creating token:", err);
  }
})();

