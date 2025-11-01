export class DriverPosition {
	private _id: number;
	private _lat!: number;
	private _long!: number;

	public get id(): number {
		return this._id;
	}

	public get lat(): number {
		return this._lat;
	}
	public set lat(value: number) {
		this._lat = value;
	}

	public get long(): number {
		return this._long;
	}
	public set long(value: number) {
		this._long = value;
	}

	constructor(id: number) {
		this._id = id;
	}

	static create(id: number) {
		return new DriverPosition(id);
	}
}
