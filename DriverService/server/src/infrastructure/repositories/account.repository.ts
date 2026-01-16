import { PrismaClient } from "@prisma/client";
import { buildQuery, toPersistence } from "./buildSqlQuery";
import { Account, accountSchema } from "../../domain/entities/account.entity";
import { logger } from "../logger/pino.logger";

export class AccountRepository implements AccountRepository {
	public static baseQuery = buildQuery(accountSchema);

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: any, account: any): Promise<any> {
		const repo = transaction ? transaction.account : this.prisma.account;

		const raw = await repo.create({
			data: toPersistence(account),
			select: AccountRepository.baseQuery,
		});

		return Account.rehydrate(raw);
	}

	async getByUsername(username: string): Promise<any> {
		const raw = await this.prisma.account.findUnique({
			where: { username },
			select: AccountRepository.baseQuery,
		});

		return Account.rehydrate(raw);
	}

	async save(transaction: any, account: any): Promise<any> {
		const repo = transaction ? transaction.account : this.prisma.account;

		const raw = await repo.update({
			where: { id: account.id },
			data: toPersistence(account),
			select: AccountRepository.baseQuery,
		});

		return Account.rehydrate(raw);
	}
}
