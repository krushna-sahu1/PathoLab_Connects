# Logistics Workflow

## Collection Flow
```
NEW → ASSIGNED → ACCEPTED → ON_THE_WAY → ARRIVED → COLLECTED
```

Or alternatively:
```
NEW → FAILED / CANCELLED / RESCHEDULED
```

## Agent Assignment Algorithm (Phase 5)
1. Resolve zone from patient address (pincode/area/sector match via zone_rules)
2. Find primary agent of the zone
3. Check agent is active + available
4. Check daily capacity not exceeded
5. If unavailable → try backup agent
6. If no agent available → Operations Queue

## Sample Flow
```
COLLECTED → IN_TRANSIT → RECEIVED_AT_LAB → ACCEPTED → PROCESSING → TESTING → REPORT_READY
```
