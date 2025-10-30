import { burnToken } from "../src/services/burn.service";

(async () => {
  const tokenId = "0.0.7085676";
  const amount = 100;
  const supplyKey = "302e020100300506032b6570042204208903cc24d1c5ba04dabd5033084d7d05225ca809caaba923223637d79ea75483";

  await burnToken(tokenId, amount, supplyKey);
})();

