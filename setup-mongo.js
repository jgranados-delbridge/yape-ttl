// MongoDB setup script for yape-ttl-sample database
// Run this script to create the database, collection, and TTL index

// Switch to the yape-ttl-sample database (creates it if it doesn't exist)
use('yape-ttl-sample');

// Create the cardHistory collection with validation schema
db.createCollection('cardHistory', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['remove_at'],
      properties: {
        remove_at: {
          bsonType: 'date',
          description: 'TTL field - document will be automatically removed at this date'
        },
        cardId: {
          bsonType: 'string',
          description: 'Card identifier'
        },
        action: {
          bsonType: 'string',
          description: 'Action performed on the card'
        },
        timestamp: {
          bsonType: 'date',
          description: 'When the action occurred'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional metadata (flexible to reach ~1KB document size)'
        }
      }
    }
  }
});

// Create TTL index on remove_at field (documents expire when remove_at date is reached)
db.cardHistory.createIndex(
  { "remove_at": 1 }, 
  { 
    expireAfterSeconds: 0,
    name: "ttl_remove_at"
  }
);

// Insert a sample document to demonstrate the structure (~1KB size)
const sampleDoc = {
  remove_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
  cardId: "card_123456789",
  action: "payment_processed",
  timestamp: new Date(),
  metadata: {
    amount: 125.50,
    currency: "USD",
    merchant: "Sample Store Inc.",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    paymentMethod: {
      type: "credit",
      last4: "1234",
      brand: "visa"
    },
    transaction: {
      id: "txn_987654321",
      status: "completed",
      authCode: "AUTH123",
      processingTime: 450
    },
    device: {
      type: "mobile",
      os: "iOS",
      version: "15.6",
      userAgent: "YapeApp/2.1.0 (iPhone; iOS 15.6; Scale/3.00)"
    },
    riskAnalysis: {
      score: 0.15,
      factors: ["location_match", "device_trusted", "spending_pattern_normal"],
      recommendations: ["approve"]
    },
    additionalData: {
      notes: "Regular customer transaction",
      tags: ["mobile_payment", "verified_merchant", "low_risk"],
      internalRef: "INT_REF_" + Math.random().toString(36).substr(2, 9),
      processingNode: "node-sf-01",
      apiVersion: "v2.1"
    }
  }
};

db.cardHistory.insertOne(sampleDoc);

print("✅ Database 'yape-ttl-sample' created successfully");
print("✅ Collection 'cardHistory' created with TTL index");
print("✅ Sample document inserted (size: ~" + JSON.stringify(sampleDoc).length + " bytes)");
print("🕒 TTL Index: Documents will expire based on 'remove_at' field");
print("📊 View collection stats: db.cardHistory.stats()");
print("🔍 View indexes: db.cardHistory.getIndexes()");
