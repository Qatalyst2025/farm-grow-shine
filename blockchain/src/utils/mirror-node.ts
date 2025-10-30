import axios from "axios";

export async function getTransactionStatus(txId: string) {
  const base = process.env.MIRROR_NODE_URL;
  const res = await axios.get(`${base}/api/v1/transactions/${txId}`);
  return res.data;
}
