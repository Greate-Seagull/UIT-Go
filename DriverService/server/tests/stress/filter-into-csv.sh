# Process Warnings: Count unique, sort, and convert to CSV
grep "level=warning" stress-test-logs.txt | \
sed 's/time="[^"]*" //g' | \
sort | uniq -c | sort -rn | \
awk '{$1=$1; print $1 "," substr($0, index($0,$2))}' > warning-filter.csv

# Generalize IDs/Connections and re-aggregate into CSV
# Note: We process the raw logs again to ensure counts are accurate after abstraction
grep "level=warning" stress-test-logs.txt | \
sed 's/time="[^"]*" //g' | \
sed -E 's/drivers\/[0-9]+\//drivers\/{id}\//g' | \
sed -E 's/tcp [0-9.]+:[0-9]+->/tcp {local_connection}->/g' | \
sort | uniq -c | sort -rn | \
awk '{$1=$1; print $1 "," substr($0, index($0,$2))}' > warning-filter-v2.csv

# Process Errors: Remove VU IDs, count unique, and convert to CSV
grep "level=error" stress-test-logs.txt | \
sed -E 's/VU [0-9]+://' | \
sed 's/time="[^"]*" //g' | \
sort | uniq -c | sort -rn | \
awk '{$1=$1; print $1 "," substr($0, index($0,$2))}' > error-filter.csv