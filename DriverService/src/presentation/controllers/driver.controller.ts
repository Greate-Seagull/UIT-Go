import { StartAcceptingUsecaseInput } from "../../application/start-accepting.usecase";
import { startAcceptingUsecase } from "../../composition-root";
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
