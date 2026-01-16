"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCachedObject = normalizeCachedObject;
function normalizeCachedObject(obj) {
    if (!obj || typeof obj !== "object")
        return obj;
    const result = {};
    for (const key of Object.keys(obj)) {
        const cleanKey = key.startsWith("_") ? key.substring(1) : key;
        const value = obj[key];
        // recursively clean nested objects
        if (value && typeof value === "object" && !Array.isArray(value)) {
            result[cleanKey] = normalizeCachedObject(value);
        }
        else {
            result[cleanKey] = value;
        }
    }
    return result;
}
//# sourceMappingURL=normalized-cache.js.map