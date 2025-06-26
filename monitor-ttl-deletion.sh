#!/bin/bash

echo "🕒 TTL Deletion Progress Monitoring"
echo "==================================="
echo "This will monitor document count as TTL deletes them"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to get current count
get_count() {
    mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --quiet --eval "db.cardHistory.countDocuments()" 2>/dev/null
}

# Function to get TTL status
get_ttl_status() {
    mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --quiet --eval "
    const now = new Date(); 
    const sample = db.cardHistory.findOne(); 
    if (sample && sample.remove_at) { 
        const timeLeft = (sample.remove_at.getTime() - now.getTime()) / 1000; 
        if (timeLeft > 0) { 
            print('⏳ ' + Math.floor(timeLeft/60) + 'm ' + Math.floor(timeLeft%60) + 's until TTL expiration'); 
        } else { 
            print('🔴 TTL expiration time reached - documents should be deleting'); 
        } 
    } else { 
        print('✅ All documents deleted or no documents found'); 
    }" 2>/dev/null
}

# Store initial count
INITIAL_COUNT=$(get_count)
if [[ $INITIAL_COUNT =~ ^[0-9]+$ ]]; then
    echo "📊 Starting document count: $(printf "%'d" $INITIAL_COUNT)"
else
    echo "❌ Could not get initial count"
    exit 1
fi

echo ""

# Monitor loop
PREV_COUNT=$INITIAL_COUNT
START_TIME=$(date +%s)
DELETION_START_TIME=""

while true; do
    COUNT=$(get_count)
    TTL_STATUS=$(get_ttl_status)
    
    if [[ $COUNT =~ ^[0-9]+$ ]]; then
        FORMATTED_COUNT=$(printf "%'d" $COUNT)
        DELETED=$((INITIAL_COUNT - COUNT))
        FORMATTED_DELETED=$(printf "%'d" $DELETED)
        
        if [ $COUNT -ne $PREV_COUNT ]; then
            # First time we detect deletion, record the start time
            if [ -z "$DELETION_START_TIME" ]; then
                DELETION_START_TIME=$(date +%s)
                echo "$(date '+%H:%M:%S') - 🔥 TTL deletion started!"
            fi
            DELETION_RATE=$((PREV_COUNT - COUNT))
            echo "$(date '+%H:%M:%S') - 📉 Documents: $FORMATTED_COUNT (Deleted: $FORMATTED_DELETED) [Rate: -$DELETION_RATE/10s]"
        else
            echo "$(date '+%H:%M:%S') - 📊 Documents: $FORMATTED_COUNT (Deleted: $FORMATTED_DELETED)"
        fi
        
        echo "                $TTL_STATUS"
        
        if [ "$COUNT" -eq 0 ]; then
            TOTAL_TIME=$(( $(date +%s) - START_TIME ))
            echo ""
            echo "🎉 All documents deleted!"
            echo "⏱️  Total monitoring time: ${TOTAL_TIME} seconds"
            
            if [ -n "$DELETION_START_TIME" ]; then
                ACTUAL_DELETION_TIME=$(( $(date +%s) - DELETION_START_TIME ))
                echo "🚀 Actual deletion time: ${ACTUAL_DELETION_TIME} seconds"
                echo "📈 Average deletion rate: $(( INITIAL_COUNT / ACTUAL_DELETION_TIME )) docs/second"
            else
                echo "📈 Average deletion rate: $(( INITIAL_COUNT / TOTAL_TIME )) docs/second"
            fi
            break
        fi
        
        PREV_COUNT=$COUNT
    else
        echo "$(date '+%H:%M:%S') - ❌ Error getting count"
    fi
    
    echo ""
    sleep 10
done
