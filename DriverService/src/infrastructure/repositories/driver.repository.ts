import { PrismaClient } from "../../generated/client/client";
import { Driver } from "../../domain/driver.entity";
import { DriverMapper } from "../mappers/driver.mapper";
import { Transaction } from "./transaction";

export class DriverRepository {
	constructor(private prisma: PrismaClient) {}

	async getById(id: any) {
		const row = await this.prisma.driver.findUnique({
			where: { id: id },
		});

		return DriverMapper.toDomain(row);
	}

	async save(tx: Transaction | null, entity: Driver) {
		const repo = tx ? tx.driver : this.prisma.driver;

		const row = await repo.update({
			where: {
				id: entity.id,
			},
			data: {
				state: entity.state as any,
			},
		});

		return DriverMapper.toDomain(row);
	}
}
