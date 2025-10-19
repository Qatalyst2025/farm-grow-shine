import { sendAuditLog } from "./send-message";

(async () => {
  await sendAuditLog("TEST_EVENT", { message: "Hello Hedera Consensus!" });
})();
