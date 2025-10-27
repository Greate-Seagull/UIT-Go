import { prisma } from "../../composition-root";
import { Driver } from "../../domain/driver.entity";
import { DriverMapper } from "../mappers/driver.mapper";

export class DriverRepository {
	async getById(id: any) {
		const row = await prisma.driver.findUnique({
			where: { id: id },
		});

		return DriverMapper.toDomain(row);
	}

	async save(entity: Driver) {
		const row = await prisma.driver.update({
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
