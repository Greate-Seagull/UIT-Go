import { prisma } from "../composition-root";

async function execute() {
	console.log(await prisma.driver.findUnique({ where: { id: 5 } }));
	// console.log(
	// 	await prisma.driver.update({
	// 		where: { id: 5 },
	// 		data: { state: "UNAVAILABLE" },
	// 	})
	// );
}

execute();
