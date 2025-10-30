import { AcceptTripUsecaseInput } from "../../application/accept-trip.usecase";
import { StartAcceptingUsecaseInput } from "../../application/start-accepting.usecase";
import {
	acceptTripUsecase,
	startAcceptingUsecase,
	updatePositionUsecase,
} from "../../composition-root";

import { Request, Response } from "express";

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

export async function controlUpdatePosition(req: Request, res: Response) {
	const result = await updatePositionUsecase.execute(req.body);
	res.json(result);
}
