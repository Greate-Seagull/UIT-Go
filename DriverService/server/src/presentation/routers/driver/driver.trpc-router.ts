import { trpc } from "../../../trpc";
import { updatePositionProcedure } from "../../controllers/driver.controller";

export const trpcDriverRouter = trpc.router({
	updatePosition: updatePositionProcedure,
});
