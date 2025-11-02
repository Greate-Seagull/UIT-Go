import {
	driverPositionRepository,
	driverRepository,
	prisma,
} from "../composition-root";
import { DriverPosition } from "../domain/driver-position.entity";
import { Driver, DriverState } from "../domain/driver.entity";

async function test() {
	const result = await prisma.driver.findMany();
	console.log(result);
}

async function testRedis() {
	const driver1 = DriverPosition.create(11);
	driver1.lat = 1.005;
	driver1.long = 1.0012;
	const driver2 = DriverPosition.create(12);
	driver2.lat = 1.0015;
	driver2.long = 1.0042;
	const driver3 = DriverPosition.create(13);
	driver3.lat = 1.025;
	driver3.long = 1.00167;
	const driver4 = DriverPosition.create(14);
	driver4.lat = 1.045;
	driver4.long = 1.0242;
	const driver5 = DriverPosition.create(15);
	driver5.lat = 1.055;
	driver5.long = 1.0512;
	await driverPositionRepository.save(driver1);
	await driverPositionRepository.save(driver2);
	await driverPositionRepository.save(driver3);
	await driverPositionRepository.save(driver4);
	await driverPositionRepository.save(driver5);
}

async function testPrisma() {
	console.log(await prisma.driver.findMany());

	// let driver1 = Driver.create(11);
	// driver1.state = DriverState.READY;
	// let driver2 = Driver.create(12);
	// driver2.state = DriverState.READY;
	// let driver3 = Driver.create(13);
	// driver3.state = DriverState.READY;
	// let driver4 = Driver.create(14);
	// driver4.state = DriverState.READY;
	// let driver5 = Driver.create(15);
	// driver5.state = DriverState.READY;

	// await driverRepository.add(null, driver1);
	// await driverRepository.save(null, driver2);
	// await driverRepository.add(null, driver3);
	// await driverRepository.add(null, driver4);
	// await driverRepository.add(null, driver5);
}

testPrisma();
