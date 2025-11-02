import {
	acceptTripUsecase,
	completeTripUsecase,
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

export async function controlStartAccepting(req: Request, res: Response) {
	try {
		const result = await startAcceptingUsecase.execute(req.body);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlAcceptTrip(req: Request, res: Response) {
	try {
		let input = new AcceptTripUsecaseInput();
		input.driverId = Number(req.body.driverId);
		input.offerId = Number(req.body.offerId);

		const result = await acceptTripUsecase.execute(input);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlCompleteTrip(req: Request, res: Response) {
	try {
		const result = await completeTripUsecase.execute(req.body);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlSearchDriver(req: Request, res: Response) {
	try {
		let input = new SearchDriverUsecaseInput();
		input.lat = Number(req.query.lat);
		input.lng = Number(req.query.lng);
		input.radiusMeters = Number(req.query.radiusMeters);
		input.limit = Number(req.query.limit);

		const result = await searchDriverUsecase.execute(input);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlRejectTrip(req: Request, res: Response) {
	try {
		let input = new RejectTripUsecaseInput();
		input.driverId = Number(req.body.driverId);
		input.offerId = Number(req.body.offerId);

		const result = await rejectTripUsecase.execute(input);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export const updatePositionProcedure = trpc.procedure
	.input(
		z.object({ driverId: z.number(), lat: z.number(), long: z.number() })
	)
	.mutation(async ({ input }) => {
		const result = await updatePositionUsecase.execute(input);
		return result;
	});
