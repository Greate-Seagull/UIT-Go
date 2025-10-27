import { StartAcceptingUsecaseInput } from "../../application/start-accepting.usecase";
import { startAcceptingUsecase } from "../../composition-root";
import { Request, Response } from "express";

export async function controlStartAccepting(req: Request, res: Response) {
	console.log("controller");

	const input: StartAcceptingUsecaseInput = new StartAcceptingUsecaseInput();
	input.id = Number(req.params.driverId);
	input.state = req.body.state;

	const result = await startAcceptingUsecase.execute(input);
	res.json(result);
}
