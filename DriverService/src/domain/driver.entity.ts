export enum DriverState {
	Ready,
}

export class Driver {
	private _id!: number;
	public get id(): number {
		return this._id;
	}
	public set id(value: number) {
		this._id = value;
	}

	private _state?: DriverState | undefined;
	public get state(): DriverState | undefined {
		return this._state;
	}
	public set state(value: DriverState | undefined) {
		this._state = value;
	}
}
