import { PrismaClient, Prisma } from "../../generated/client/client";

export type Transaction = Prisma.TransactionClient;

export class TransactionManager {
	constructor(private readonly prisma: PrismaClient) {}

	async transaction(
		callback: (tx: Transaction) => Promise<any>
	): Promise<any> {
		return await this.prisma.$transaction(callback);
	}
}
