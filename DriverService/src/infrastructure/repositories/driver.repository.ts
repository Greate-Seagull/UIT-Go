import { prisma } from "../../composition-root";
import { DriverMapper } from "../mappers/driver.mapper";

export class DriverRepository {
	async getById(id: any) {
		const row = prisma.driver.findUnique({
			where: { id: id },
			select: { id: true, state: true },
		});

		return DriverMapper.toDomain(row);
	}
}
