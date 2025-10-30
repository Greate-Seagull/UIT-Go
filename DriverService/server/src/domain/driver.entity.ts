export enum DriverState {
	READY = "READY",
	TRANSPORTING = "TRANSPORTING",
	UNAVAILABLE = "UNAVAILABLE",
}

export class Driver {
	private _id: number;
	public get id(): number {
		return this._id;
	}

	private _state!: DriverState;
	public get state(): DriverState {
		return this._state;
	}
	public set state(value: DriverState) {
		this._state = value;
	}

	constructor(id: number) {
		this._id = id;
	}

	static create(id: number) {
		return new Driver(id);
	}
}
