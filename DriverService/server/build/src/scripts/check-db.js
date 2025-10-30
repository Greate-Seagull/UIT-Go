"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_root_1 = require("../composition-root");
async function test() {
    const result = await composition_root_1.prisma.driver.findMany();
    console.log(result);
}
test();
//# sourceMappingURL=check-db.js.map