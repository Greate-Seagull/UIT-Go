import { PrismaClient } from "@prisma/client";
import { buildQuery, toPersistence } from "./buildSqlQuery";
import { Account, accountSchema } from "../../domain/entities/account.entity";
import { logger } from "../logger/pino.logger";

export class AccountRepository implements AccountRepository {
	public static baseQuery = buildQuery(accountSchema);

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: any, account: any): Promise<any> {
		logger.debug("AccountRepository.add: Start", {
			account: { username: account.username },
		});

		const repo = transaction ? transaction.account : this.prisma.account;

		try {
			const raw = await repo.create({
				data: toPersistence(account),
				select: AccountRepository.baseQuery,
			});

			logger.debug("AccountRepository.add: Saved", {
				accountId: raw.id,
			});

			return Account.rehydrate(raw);
		} catch (error: any) {
			logger.error("AccountRepository.add: Failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}

	async getByUsername(username: string): Promise<any> {
		logger.debug("AccountRepository.getByUsername: Query", { username });

		try {
			const raw = await this.prisma.account.findUnique({
				where: { username },
				select: AccountRepository.baseQuery,
			});

			if (!raw) {
				logger.debug("AccountRepository.getByUsername: Not found", {
					username,
				});
				return null;
			}

			logger.debug("AccountRepository.getByUsername: Found", {
				accountId: raw.id,
			});

			return Account.rehydrate(raw);
		} catch (error: any) {
			logger.error("AccountRepository.getByUsername: Failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}

	async save(transaction: any, account: any): Promise<any> {
		logger.debug("AccountRepository.save: Start", {
			accountId: account.id,
		});

		const repo = transaction ? transaction.account : this.prisma.account;

		try {
			const raw = await repo.update({
				where: { id: account.id },
				data: toPersistence(account),
				select: AccountRepository.baseQuery,
			});

			logger.debug("AccountRepository.save: Updated", {
				accountId: raw.id,
			});

			return Account.rehydrate(raw);
		} catch (error: any) {
			logger.error("AccountRepository.save: Failed", {
				accountId: account.id,
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
