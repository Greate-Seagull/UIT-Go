export interface Command {
	request: any;
	usecase: {
		execute(request: any): Promise<any>;
	};
	resolve: (value: any) => void;
	reject: (err: any) => void;
}

export class InMemoryQueue<T> {
	private queue: T[] = [];
	private maxSize: number;

	constructor(maxSize = 10000) {
		this.maxSize = maxSize;
	}

	push(item: T): boolean {
		if (this.queue.length >= this.maxSize) return false;
		this.queue.push(item);
		return true;
	}

	pop(): T | undefined {
		return this.queue.shift();
	}

	size(): number {
		return this.queue.length;
	}
}

export const requestQueue = new InMemoryQueue<Command>(5000);
