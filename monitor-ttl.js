// MongoDB TTL Monitoring Script
// This script helps monitor the TTL deletion process

use('yape-ttl-sample');

print("🕒 TTL Deletion Monitoring");
print("=" .repeat(50));

// Get current time and TTL expiration time
const now = new Date();
const sampleDoc = db.cardHistory.findOne();
if (sampleDoc && sampleDoc.remove_at) {
    const expirationTime = sampleDoc.remove_at;
    const timeUntilExpiration = (expirationTime.getTime() - now.getTime()) / 1000; // seconds
    
    print("📅 Current time: " + now);
    print("⏰ TTL expiration time: " + expirationTime);
    
    if (timeUntilExpiration > 0) {
        print("⏳ Time until expiration: " + Math.floor(timeUntilExpiration / 60) + " minutes " + Math.floor(timeUntilExpiration % 60) + " seconds");
        print("⚠️  Documents will start being deleted around: " + new Date(expirationTime.getTime() + 60000)); // +1 minute for TTL background task
    } else {
        print("🔴 Documents should be expiring now! (TTL background task runs every ~60 seconds)");
    }
} else {
    print("❌ No documents found or missing remove_at field");
}

// Current document count
const currentCount = db.cardHistory.countDocuments();
print("📊 Current document count: " + currentCount);

// TTL Index information
print("\n🔍 TTL Index Information:");
const indexes = db.cardHistory.getIndexes();
indexes.forEach(index => {
    if (index.expireAfterSeconds !== undefined) {
        print("- Index name: " + index.name);
        print("- Index key: " + JSON.stringify(index.key));
        print("- expireAfterSeconds: " + index.expireAfterSeconds);
        print("- TTL behavior: Documents expire when the indexed field value + expireAfterSeconds is reached");
    }
});

print("\n📈 Collection Stats:");
const stats = db.cardHistory.stats();
print("- Storage size: " + (stats.storageSize / 1024 / 1024).toFixed(2) + " MB");
print("- Average document size: " + stats.avgObjSize + " bytes");
print("- Total indexes: " + stats.nindexes);

print("\n💡 TTL Deletion Facts:");
print("- MongoDB runs TTL background task approximately every 60 seconds");
print("- Deletion may take time depending on collection size and server load");
print("- Large collections may take several minutes to fully clear");
print("- You can monitor progress by running this script repeatedly");

print("\n✅ Monitoring script completed. Run again to check progress!");
