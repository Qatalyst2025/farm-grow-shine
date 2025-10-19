import { mintToken } from "../src/services/mint.service";

async function main() {
  await mintToken();
}

main().catch(console.error);

