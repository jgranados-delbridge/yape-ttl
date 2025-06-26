// MongoDB bulk insert script for cardHistory collection
// Inserts 2.5 million documents with remove_at set to 5 minutes from script execution

use('yape-ttl-sample');

// Set remove_at to 5 minutes from now
const now = new Date();
const removeAtTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

print("🚀 Starting bulk insert of 2.5 million documents...");
print("📅 Remove at time set to: " + removeAtTime);

// Configuration
const TOTAL_DOCS = 2500000;
const BATCH_SIZE = 1000; // Smaller batches for reliability
const TOTAL_BATCHES = Math.ceil(TOTAL_DOCS / BATCH_SIZE);

print("📊 Configuration: " + TOTAL_DOCS + " documents in " + TOTAL_BATCHES + " batches of " + BATCH_SIZE);

// Sample data arrays for variety
const actions = [
  "payment_processed", "card_blocked", "card_unblocked", "payment_failed", 
  "refund_issued", "chargeback_received", "fraud_detected", "limit_exceeded",
  "authorization_approved", "authorization_declined"
];

const merchants = [
  "Amazon", "Walmart", "Target", "Starbucks", "McDonald's", "Apple Store",
  "Google Play", "Netflix", "Spotify", "Uber", "Lyft", "Airbnb"
];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville"
];

// Function to generate random document
function generateRandomDoc(index) {
  const action = actions[Math.floor(Math.random() * actions.length)];
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    remove_at: removeAtTime,
    cardId: "card_" + (1000000000 + index),
    action: action,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    metadata: {
      amount: Math.round((Math.random() * 500 + 10) * 100) / 100,
      currency: "USD",
      merchant: merchant + " Store #" + Math.floor(Math.random() * 999 + 1),
      location: {
        city: city,
        state: "CA",
        country: "USA",
        coordinates: { 
          lat: 37.7749 + (Math.random() - 0.5) * 2, 
          lng: -122.4194 + (Math.random() - 0.5) * 2 
        }
      },
      paymentMethod: {
        type: Math.random() > 0.5 ? "credit" : "debit",
        last4: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        brand: Math.random() > 0.5 ? "visa" : "mastercard"
      },
      transaction: {
        id: "txn_" + Math.random().toString(36).substr(2, 12),
        status: Math.random() > 0.1 ? "completed" : "failed",
        authCode: "AUTH" + Math.floor(Math.random() * 1000),
        processingTime: Math.floor(Math.random() * 1000 + 100)
      },
      device: {
        type: "mobile",
        os: "iOS",
        version: "17.2",
        userAgent: "YapeApp/2.1.0 (mobile; iOS 17.2; Scale/3.00)"
      },
      additionalData: {
        notes: "Bulk inserted transaction #" + index,
        tags: ["bulk_insert", "test_data"],
        internalRef: "BULK_" + index + "_" + Math.random().toString(36).substr(2, 6),
        processingNode: "node-bulk-01",
        apiVersion: "v2.1",
        batchId: Math.floor(index / BATCH_SIZE) + 1
      }
    }
  };
}

// Perform bulk insert in batches
let totalInserted = 0;
const startTime = new Date();

for (let batchNum = 1; batchNum <= TOTAL_BATCHES; batchNum++) {
  const batchStartIndex = (batchNum - 1) * BATCH_SIZE;
  const batchEndIndex = Math.min(batchNum * BATCH_SIZE, TOTAL_DOCS);
  
  // Generate batch of documents
  const batch = [];
  for (let i = batchStartIndex; i < batchEndIndex; i++) {
    batch.push(generateRandomDoc(i + 1));
  }
  
  try {
    // Insert batch
    const result = db.cardHistory.insertMany(batch, { ordered: false });
    totalInserted += result.insertedIds.length;
    
    // Progress reporting every 500 batches or at the end
    if (batchNum % 500 === 0 || batchNum === TOTAL_BATCHES) {
      const elapsed = (new Date() - startTime) / 1000;
      const rate = elapsed > 0 ? Math.round(totalInserted / elapsed) : 0;
      const progress = ((totalInserted / TOTAL_DOCS) * 100).toFixed(1);
      
      print("📊 Batch " + batchNum + "/" + TOTAL_BATCHES + " completed. Progress: " + progress + "% (" + totalInserted + "/" + TOTAL_DOCS + ") - Rate: " + rate + " docs/sec");
    }
  } catch (error) {
    print("❌ Error in batch " + batchNum + ": " + error.message);
    break;
  }
}

const endTime = new Date();
const totalTime = (endTime - startTime) / 1000;
const avgRate = totalTime > 0 ? Math.round(totalInserted / totalTime) : 0;

print("\n🎉 Bulk insert completed!");
print("📈 Total documents inserted: " + totalInserted);
print("⏱️  Total time: " + totalTime.toFixed(2) + " seconds");
print("🚀 Average insertion rate: " + avgRate + " documents/second");
print("📅 All documents will expire at: " + removeAtTime + " (5 minutes from script start)");

// Verify final count
const finalCount = db.cardHistory.countDocuments();
print("💾 Final verification count: " + finalCount + " documents");

// Show some sample documents
print("\n📄 Sample documents:");
db.cardHistory.find().limit(3).forEach(doc => {
  print("- Document ID: " + doc._id + ", Card: " + doc.cardId + ", Action: " + doc.action);
});

print("\n✅ Bulk insert operation completed successfully!");
