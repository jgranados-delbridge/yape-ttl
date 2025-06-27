# MongoDB TTL (Time-To-Live) Sample Project

## Project Overview

This project demonstrates MongoDB's TTL (Time-To-Live) functionality using a realistic dataset of card transaction history. The goal is to create a large-scale test environment to observe how MongoDB automatically deletes documents based on a TTL field, and to measure the performance characteristics of this deletion process. Documents are set to expire 5 minutes after insertion, allowing for real-time observation of the TTL deletion process.

## What We Built

### Database Structure
- **Database**: `yape-ttl-sample`
- **Collection**: `cardHistory` (following MongoDB camelCase naming convention)
- **Document Size**: ~1KB per document
- **Total Documents**: 2.5 million records

### Key Features
1. **TTL Index**: Documents automatically expire based on the `remove_at` field
2. **Realistic Data**: Each document contains comprehensive card transaction metadata
3. **Bulk Insert Performance**: Optimized batch insertion for large datasets
4. **Monitoring Tools**: Scripts to track TTL deletion progress

### Document Schema
```javascript
{
  remove_at: Date,           // TTL field - documents expire 5 minutes after insertion
  cardId: String,           // Unique card identifier
  action: String,           // Transaction action type
  timestamp: Date,          // When the action occurred
  metadata: {               // Rich transaction data (~1KB total)
    amount: Number,
    currency: String,
    merchant: String,
    location: Object,
    paymentMethod: Object,
    transaction: Object,
    device: Object,
    additionalData: Object
  }
}
```

## Project Files

### Core Scripts
- `setup-mongo.js` - Initial database and collection setup with TTL index
- `test-insert.js` - Small test insertion (1,000 documents) for validation
- `bulk-insert.js` - Main bulk insertion script (2.5M documents)

### Monitoring Tools
- `monitor-ttl.js` - Check TTL status and collection information
- `monitor-ttl-deletion.sh` - Real-time monitoring of document deletion
- `monitor-progress.sh` - Track bulk insertion progress

### Infrastructure
- `docker-compose.yml` - MongoDB and Mongo Express containers
- `README.md` - This documentation

## Prerequisites

1. **Docker & Docker Compose** - For running MongoDB and Mongo Express
2. **MongoDB Shell (mongosh)** - For running scripts
   ```bash
   brew install mongosh  # macOS with Homebrew
   ```

## Setup Instructions

### 1. Start the Database
```bash
cd /path/to/project
docker-compose up -d
```

This starts:
- **MongoDB**: `localhost:27017` (admin/password123)
- **Mongo Express**: `http://localhost:8081` (admin/admin123)

### 2. Initialize the Database
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin setup-mongo.js
```

### 3. Test with Small Dataset (Optional)
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin test-insert.js
```

### 4. Run Full Bulk Insert
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin bulk-insert.js
```

## TTL Configuration

### Expiration Settings
- **TTL Field**: `remove_at`
- **Expiration Time**: Set to 5 minutes from the time the script is executed
- **TTL Index**: `expireAfterSeconds: 0` (documents expire exactly at the `remove_at` time)

### MongoDB TTL Behavior
- TTL background task runs approximately every 60 seconds
- Deletion time depends on collection size and server load
- Large collections (2.5M docs) may take several minutes to fully clear after the TTL expiration time
- **Quick Testing**: With 5-minute expiration, you can observe the deletion process in real-time

## Monitoring TTL Deletion

### Real-time Monitoring
```bash
chmod +x monitor-ttl-deletion.sh
./monitor-ttl-deletion.sh
```

**Note**: With 5-minute expiration, start monitoring immediately after running the bulk insert to observe the deletion process in real-time.

### TTL Status Check
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin monitor-ttl.js
```

### Manual Count Check
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --eval "db.cardHistory.countDocuments()"
```

## Performance Characteristics

### Insertion Performance
- **Batch Size**: 1,000 documents per batch
- **Expected Rate**: 5,000-15,000 documents/second (varies by hardware)
- **Total Time**: ~3-8 minutes for 2.5M documents

### Deletion Performance
- **TTL Check Frequency**: Every ~60 seconds
- **Deletion Rate**: Varies significantly based on:
  - Document size and complexity
  - Available system resources
  - Other database operations
  - Storage engine configuration

## Web Interface

Access Mongo Express at `http://localhost:8081` to:
- View the `yape-ttl-sample` database
- Browse the `cardHistory` collection
- Monitor document counts in real-time
- Examine document structure and indexes

## Use Cases

This project is useful for:
1. **TTL Performance Testing** - Understanding deletion rates at scale with quick turnaround (5-minute expiration)
2. **Database Capacity Planning** - Testing storage and memory usage
3. **MongoDB Learning** - Hands-on experience with TTL indexes and real-time deletion observation
4. **Cleanup Strategy Validation** - Testing automated data retention policies with immediate feedback

## Key Learnings

### TTL Best Practices
- Use compound indexes when TTL field is frequently queried with other fields
- Monitor TTL deletion performance under load
- Consider the impact of document size on deletion speed
- Plan for gradual deletion rather than instant removal

### Performance Insights
- Smaller batch sizes provide more reliable insertion
- Progress reporting helps track long-running operations
- Error handling is crucial for bulk operations
- TTL deletion is not instantaneous for large collections

## Troubleshooting

### Common Issues
1. **Slow TTL deletion**: Normal for large collections
2. **Connection timeouts**: Check Docker container status
3. **Memory issues**: Reduce batch size or total document count

### Debug Commands
```bash
# Check container status
docker ps

# View MongoDB logs
docker logs mongodb

# Verify TTL index
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --eval "db.cardHistory.getIndexes()"
```

## Future Enhancements

Potential improvements:
- Variable TTL times for different document types
- Compound TTL indexes for more complex expiration logic
- Performance comparison with manual deletion strategies
- Integration with monitoring systems (Prometheus/Grafana)
- Automated testing of different document sizes and counts

---

## Quick Start Summary

```bash
# 1. Start containers
docker-compose up -d

# 2. Setup database
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin setup-mongo.js

# 3. Run bulk insert (documents will expire in 5 minutes)
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin bulk-insert.js

# 4. Monitor TTL deletion (in another terminal - start immediately!)
./monitor-ttl-deletion.sh

# 5. View in browser
open http://localhost:8081
```

This project provides a comprehensive environment for understanding and testing MongoDB's TTL functionality at scale, with quick 5-minute expiration for real-time observation.
