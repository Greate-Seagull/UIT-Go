export type Usecase = {
    execute(request: any): Promise<any>;
};
export declare class JobTable {
    private jobs;
    add(key: string, value: Usecase): void;
    get(key: string): Usecase | undefined;
}
//# sourceMappingURL=job-table.d.ts.map