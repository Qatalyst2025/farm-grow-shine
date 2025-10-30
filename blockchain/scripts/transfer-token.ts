import { transferToken } from "../src/services/transfer.service";

(async () => {
  const tokenId = "0.0.7085676";
  const senderId = process.env.HEDERA_ACCOUNT_ID!;
  const receiverId = "0.0.7075035";
  const senderKey = process.env.HEDERA_PRIVATE_KEY!;
  const amount = 50;

  await transferToken(tokenId, senderId, senderKey, receiverId, amount);
})();

