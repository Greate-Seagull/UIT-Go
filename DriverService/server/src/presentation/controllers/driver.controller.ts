import {
	acceptTripUsecase,
	completeTripUsecase,
	getPositionUsecase,
	rejectTripUsecase,
	searchDriverUsecase,
	startAcceptingUsecase,
	updatePositionUsecase,
} from "../../composition-root";

import { Request, Response } from "express";
import { trpc } from "../../trpc";
import { z } from "zod";
import { SearchDriverUsecaseInput } from "../../application/search-driver.usecase";
import { AcceptTripUsecaseInput } from "../../application/accept-trip.usecase";
import { RejectTripUsecaseInput } from "../../application/reject-trip.usecase";
import {
	GetPositionUsecase,
	GetPositionUsecaseInput,
} from "../../application/get-position.usecase";
import { StartAcceptingUsecaseInput } from "../../application/start-accepting.usecase";

export async function controlStartAccepting(req: Request, res: Response) {
	try {
		console.log(`Call API PUT /api/drivers/me/start`);

		let input = new StartAcceptingUsecaseInput();
		input.id = Number(req.body.id);

		const result = await startAcceptingUsecase.execute(input);
		res.json(result);

		console.log(`Complete API PUT /api/drivers/me/start`);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlAcceptTrip(req: Request, res: Response) {
	try {
		console.log("Call API PUT /api/drivers/me/accept");

		let input = new AcceptTripUsecaseInput();
		input.driverId = Number(req.body.driverId);
		input.offerId = Number(req.body.offerId);

		const result = await acceptTripUsecase.execute(input);
		res.json(result);

		console.log("Complete API PUT /api/drivers/me/accept");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlCompleteTrip(req: Request, res: Response) {
	try {
		console.log("Call API PUT /api/drivers/me/complete");

		const result = await completeTripUsecase.execute(req.body);
		res.json(result);

		console.log("Complete API PUT /api/drivers/me/complete");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlSearchDriver(req: Request, res: Response) {
	try {
		console.log("Call API GET /api/drivers/search");

		let input = new SearchDriverUsecaseInput();
		input.lat = Number(req.query.lat);
		input.lng = Number(req.query.lng);
		input.radiusMeters = Number(req.query.radiusMeters);
		input.limit = Number(req.query.limit);

		const result = await searchDriverUsecase.execute(input);
		res.json(result);

		console.log("Complete API GET /api/drivers/search");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlRejectTrip(req: Request, res: Response) {
	try {
		console.log("Call API PUT /api/drivers/me/reject");

		let input = new RejectTripUsecaseInput();
		input.driverId = Number(req.body.driverId);
		input.offerId = Number(req.body.offerId);

		const result = await rejectTripUsecase.execute(input);
		res.json(result);

		console.log("Complete API PUT /api/drivers/me/reject");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlGetPosition(req: Request, res: Response) {
	try {
		console.log(
			`Call API GET /api/drivers/${req.params.driverId}/position`
		);

		let input = new GetPositionUsecaseInput();
		input.driverId = Number(req.params.driverId);

		const result = await getPositionUsecase.execute(input);
		res.json(result);

		console.log(
			`Complete API GET /api/drivers/${req.params.driverId}/position`
		);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export const updatePositionProcedure = trpc.procedure
	.input(
		z.object({ driverId: z.number(), lat: z.number(), long: z.number() })
	)
	.mutation(async ({ input }) => {
		console.log("Call API POST trpc/drivers.updatePosition");

		const result = await updatePositionUsecase.execute(input);

		console.log("Complete API POST trpc/drivers.updatePosition");
		return result;
	});
