grep "level=warning" stress-test-logs.txt | sed 's/time="[^"]*" //g' | sort | uniq > warning-filter.txt
# This command removes specific driver IDs and local connection details to expose unique errors
sed -E 's/drivers\/[0-9]+\//drivers\/{id}\//g' warning-filter.txt | \
sed -E 's/tcp [0-9.]+:[0-9]+->/tcp {local_connection}->/g' | \
sort | uniq > warning-filter-v2.txt
grep "level=error" stress-test-logs.txt | sed -E 's/VU [0-9]+://' | sed 's/time="[^"]*" //g' | sort | uniq > error-filter.txt