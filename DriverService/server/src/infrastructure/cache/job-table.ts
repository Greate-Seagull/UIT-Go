export type Usecase = {
	execute(request: any): Promise<any>;
};

export class JobTable {
	private jobs = new Map<string, Usecase>();

	add(key: string, value: Usecase) {
		this.jobs.set(key, value);
	}

	get(key: string) {
		return this.jobs.get(key);
	}
}
