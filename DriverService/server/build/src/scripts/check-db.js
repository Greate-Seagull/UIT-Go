"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composition_root_1 = require("../composition-root");
async function execute() {
    console.log(await composition_root_1.prisma.driver.count());
    // console.log(
    // 	await prisma.driver.update({
    // 		where: { id: 5 },
    // 		data: { state: "UNAVAILABLE" },
    // 	})
    // );
}
execute();
//# sourceMappingURL=check-db.js.map