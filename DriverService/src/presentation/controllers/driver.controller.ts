import { AcceptTripUsecaseInput } from "../../application/accept-trip.usecase";
import { StartAcceptingUsecaseInput } from "../../application/start-accepting.usecase";
import {
	acceptTripUsecase,
	startAcceptingUsecase,
} from "../../composition-root";

import { Request, Response } from "express";

export async function controlStartAccepting(req: Request, res: Response) {
	const input: StartAcceptingUsecaseInput = new StartAcceptingUsecaseInput();
	input.id = Number(req.params.driverId);
	input.state = req.body.state;

	try {
		const result = await startAcceptingUsecase.execute(input);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}

export async function controlAcceptTrip(req: Request, res: Response) {
	let input = new AcceptTripUsecaseInput();
	input.driverId = Number(req.params.driverId);
	input.tripId = Number(req.body.tripId);

	try {
		const result = await acceptTripUsecase.execute(input);
		res.json(result);
	} catch (e: any) {
		res.json({ message: e.message });
	}
}
