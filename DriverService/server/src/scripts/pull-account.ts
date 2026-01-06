import { PrismaClient } from "@prisma/client";
import { createWriteStream } from "fs";
import { stringify } from "csv-stringify";

const prisma = new PrismaClient();

async function exportUsernamesToCsv() {
	try {
		// Fetch accounts
		const accounts = await prisma.account.findMany({
			select: { username: true },
		});

		// Create CSV writer
		const writableStream = createWriteStream("usernames.csv");
		const stringifier = stringify({ header: true, columns: ["username"] });

		stringifier.pipe(writableStream);

		// Write data
		accounts.forEach((account) => {
			stringifier.write([account.username]);
		});

		stringifier.end();

		console.log(`Exported ${accounts.length} usernames to usernames.csv`);
	} catch (error) {
		console.error("Error exporting usernames:", error);
	} finally {
		await prisma.$disconnect();
	}
}

async function execute() {
	console.log(
		await prisma.account.findMany({
			select: { username: true },
		})
	);
}

execute();
