// Test script - insert 1000 documents first to verify everything works
use('yape-ttl-sample');

// Set remove_at to 5 minutes from now
const now = new Date();
const removeAtTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

print("🧪 Testing with 1000 documents first...");
print("📅 Remove at time: " + removeAtTime);

// Clear existing data for clean test
db.cardHistory.deleteMany({});
print("🧹 Cleared existing documents");

const batch = [];
for (let i = 1; i <= 1000; i++) {
  batch.push({
    remove_at: removeAtTime,
    cardId: "test_card_" + i,
    action: "test_payment",
    timestamp: new Date(),
    metadata: {
      amount: 100.00,
      currency: "USD",
      merchant: "Test Store",
      testIndex: i
    }
  });
}

const result = db.cardHistory.insertMany(batch);
print("✅ Inserted " + result.insertedIds.length + " test documents");
print("📊 Total count: " + db.cardHistory.countDocuments());
print("🔍 Sample document: ");
printjson(db.cardHistory.findOne());
