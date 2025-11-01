"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = exports.DriverState = void 0;
var DriverState;
(function (DriverState) {
    DriverState["READY"] = "READY";
    DriverState["TRANSPORTING"] = "TRANSPORTING";
    DriverState["UNAVAILABLE"] = "UNAVAILABLE";
})(DriverState || (exports.DriverState = DriverState = {}));
class Driver {
    _id;
    get id() {
        return this._id;
    }
    _state;
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    constructor(id) {
        this._id = id;
    }
    static create(id) {
        return new Driver(id);
    }
}
exports.Driver = Driver;
//# sourceMappingURL=driver.entity.js.map