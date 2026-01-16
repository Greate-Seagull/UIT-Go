"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTable = void 0;
class JobTable {
    jobs = new Map();
    add(key, value) {
        this.jobs.set(key, value);
    }
    get(key) {
        return this.jobs.get(key);
    }
}
exports.JobTable = JobTable;
//# sourceMappingURL=job-table.js.map