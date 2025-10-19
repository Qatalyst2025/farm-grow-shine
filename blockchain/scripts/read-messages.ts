import dotenv from "dotenv";

dotenv.config();

const MIRROR_NODE = process.env.HEDERA_MIRROR_NODE_URL!;
const TOPIC_ID = process.env.HEDERA_TOPIC_ID!;

async function readMessages() {
  try {
    console.log('📖 Reading messages from topic:', TOPIC_ID);
    console.log('🌐 Using mirror node:', MIRROR_NODE);
    
    const res = await fetch(`${MIRROR_NODE}/topics/${TOPIC_ID}/messages`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    console.log("\n📜 Recent Messages:");
    
    if (!data.messages || data.messages.length === 0) {
      console.log("No messages found in the topic.");
      return;
    }
    
    data.messages.forEach((msg: any, index: number) => {
      console.log(`\n--- Message ${index + 1} ---`);
      console.log('Timestamp:', msg.consensus_timestamp);
      console.log('Sequence Number:', msg.sequence_number);
      
      try {
        const decoded = Buffer.from(msg.message, "base64").toString("utf8");
        const parsed = JSON.parse(decoded);
        console.log('Content:', parsed);
      } catch (parseError) {
        console.log('Raw message (base64):', msg.message);
        console.log('⚠️  Could not parse message as JSON');
      }
    });
    
    console.log(`\n✅ Total messages: ${data.messages.length}`);
    
  } catch (error) {
    console.error("❌ Error reading messages:", error);
  }
}

readMessages();
