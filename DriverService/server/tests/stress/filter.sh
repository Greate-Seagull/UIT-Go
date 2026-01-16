# Filter warnings, remove timestamps, and count unique occurrences
grep "level=warning" stress-test-logs.txt | sed 's/time="[^"]*" //g' | sort | uniq -c | sort -rn > warning-filter.txt

# Generalize IDs and connections, then re-aggregate and count
sed -E 's/drivers\/[0-9]+\//drivers\/{id}\//g' warning-filter.txt | \
sed -E 's/tcp [0-9.]+:[0-9]+->/tcp {local_connection}->/g' | \
sort | uniq -c | sort -rn > warning-filter-v2.txt

# Filter errors, remove VU IDs and timestamps, and count unique occurrences
grep "level=error" stress-test-logs.txt | sed -E 's/VU [0-9]+://' | sed 's/time="[^"]*" //g' | sort | uniq -c | sort -rn > error-filter.txt