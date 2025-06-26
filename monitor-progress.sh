#!/bin/bash

echo "📊 Monitoring bulk insert progress..."
echo "Press Ctrl+C to stop monitoring"
echo ""

while true; do
    COUNT=$(mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --quiet --eval "db.cardHistory.countDocuments()" 2>/dev/null)
    
    if [[ $COUNT =~ ^[0-9]+$ ]]; then
        FORMATTED_COUNT=$(printf "%'d" $COUNT)
        PERCENTAGE=$(echo "scale=2; $COUNT / 2500000 * 100" | bc -l 2>/dev/null || echo "0")
        echo "$(date '+%H:%M:%S') - Documents inserted: $FORMATTED_COUNT / 2,500,000 (${PERCENTAGE}%)"
        
        if [ "$COUNT" -ge 2500000 ]; then
            echo "🎉 Bulk insert completed!"
            break
        fi
    else
        echo "$(date '+%H:%M:%S') - Checking progress..."
    fi
    
    sleep 10
done
