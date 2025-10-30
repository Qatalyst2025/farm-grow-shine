import fs from "fs";
import path from "path";

const artifactPath = path.resolve("../backend/src/contracts/example/build/SimpleStorage.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
let bytecode = artifact.bytecode?.object || artifact.bytecode || "";

if (bytecode.includes("a26469706673")) {
  const clean = bytecode.split("a26469706673")[0]; // cut metadata
  artifact.bytecode.object = clean + "00"; // pad with one byte
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log("🧹 Cleaned metadata trailer from bytecode.");
} else {
  console.log("✅ No metadata trailer found.");
}
