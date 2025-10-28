import { prisma } from "../composition-root";

async function test() {
	const result = await prisma.driver.findMany();
	console.log(result);
}

test();
