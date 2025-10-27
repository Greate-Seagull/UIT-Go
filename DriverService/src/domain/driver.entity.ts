export enum DriverState {
	READY = "READY",
	UNAVAILABLE = "UNAVAILABLE",
}

export class Driver {
	private _id!: number;
	public get id(): number {
		return this._id;
	}
	public set id(value: number) {
		this._id = value;
	}

	private _state!: DriverState;
	public get state(): DriverState {
		return this._state;
	}
	public set state(value: DriverState) {
		this._state = value;
	}
}
