"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_root_1 = require("../composition-root");
async function test() {
    const result = await composition_root_1.axiosClient.post("/trips", {
        pickupLat: "1",
        pickupLng: "1",
        dropoffLat: "1",
        dropoffLng: "1",
    }, {
        headers: {
            "X-User-Id": "1",
        },
    });
    console.log(result.status);
}
test();
//# sourceMappingURL=check-api.js.map