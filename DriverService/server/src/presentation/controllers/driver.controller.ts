import {
	acceptTripUsecase,
	completeTripUsecase,
	startAcceptingUsecase,
	updatePositionUsecase,
} from "../../composition-root";

import { Request, Response } from "express";
import { trpc } from "../../trpc";
import { z } from "zod";

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
		const result = await acceptTripUsecase.execute(req.body);
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

export const updatePositionProcedure = trpc.procedure
	.input(
		z.object({ driverId: z.number(), lat: z.number(), long: z.number() })
	)
	.mutation(async ({ input }) => {
		const result = await updatePositionUsecase.execute(input);
		return result;
	});
