export function normalizeCachedObject(obj: any): any {
	if (!obj || typeof obj !== "object") return obj;

	const result: any = {};

	for (const key of Object.keys(obj)) {
		const cleanKey = key.startsWith("_") ? key.substring(1) : key;
		const value = obj[key];

		// recursively clean nested objects
		if (value && typeof value === "object" && !Array.isArray(value)) {
			result[cleanKey] = normalizeCachedObject(value);
		} else {
			result[cleanKey] = value;
		}
	}

	return result;
}
