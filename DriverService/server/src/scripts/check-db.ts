import { prisma } from "../composition-root";

async function execute() {
	console.log(await prisma.driver.count());
	// console.log(
	// 	await prisma.driver.update({
	// 		where: { id: 5 },
	// 		data: { state: "UNAVAILABLE" },
	// 	})
	// );
}

execute();
