"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPosition = void 0;
class DriverPosition {
    _id;
    _lat;
    _long;
    get id() {
        return this._id;
    }
    get lat() {
        return this._lat;
    }
    set lat(value) {
        this._lat = value;
    }
    get long() {
        return this._long;
    }
    set long(value) {
        this._long = value;
    }
    constructor(id) {
        this._id = id;
    }
    static create(id) {
        return new DriverPosition(id);
    }
}
exports.DriverPosition = DriverPosition;
//# sourceMappingURL=driver-position.entity.js.map