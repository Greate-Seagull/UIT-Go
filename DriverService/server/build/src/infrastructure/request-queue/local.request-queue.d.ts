export interface Command {
    request: any;
    usecase: {
        execute(request: any): Promise<any>;
    };
    resolve: (value: any) => void;
    reject: (err: any) => void;
}
export declare class InMemoryQueue<T> {
    private queue;
    private maxSize;
    constructor(maxSize?: number);
    push(item: T): boolean;
    pop(): T | undefined;
    size(): number;
}
export declare const requestQueue: InMemoryQueue<Command>;
//# sourceMappingURL=local.request-queue.d.ts.map