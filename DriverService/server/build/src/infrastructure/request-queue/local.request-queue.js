"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestQueue = exports.InMemoryQueue = void 0;
class InMemoryQueue {
    queue = [];
    maxSize;
    constructor(maxSize = 10000) {
        this.maxSize = maxSize;
    }
    push(item) {
        if (this.queue.length >= this.maxSize)
            return false;
        this.queue.push(item);
        return true;
    }
    pop() {
        return this.queue.shift();
    }
    size() {
        return this.queue.length;
    }
}
exports.InMemoryQueue = InMemoryQueue;
exports.requestQueue = new InMemoryQueue(5000);
//# sourceMappingURL=local.request-queue.js.map