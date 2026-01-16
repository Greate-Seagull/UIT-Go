"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = require("fs");
const csv_stringify_1 = require("csv-stringify");
const prisma = new client_1.PrismaClient();
async function exportUsernamesToCsv() {
    try {
        // Fetch accounts
        const accounts = await prisma.account.findMany({
            select: { username: true },
        });
        // Create CSV writer
        const writableStream = (0, fs_1.createWriteStream)("usernames.csv");
        const stringifier = (0, csv_stringify_1.stringify)({ header: true, columns: ["username"] });
        stringifier.pipe(writableStream);
        // Write data
        accounts.forEach((account) => {
            stringifier.write([account.username]);
        });
        stringifier.end();
        console.log(`Exported ${accounts.length} usernames to usernames.csv`);
    }
    catch (error) {
        console.error("Error exporting usernames:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
async function execute() {
    console.log(await prisma.account.findMany({
        select: { username: true },
    }));
}
execute();
//# sourceMappingURL=pull-account.js.map