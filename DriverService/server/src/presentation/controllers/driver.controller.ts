import { updatePositionUsecase } from "../../composition-root";
import { trpc } from "../../trpc";
import { z } from "zod";

export const updatePositionProcedure = trpc.procedure
	.input(z.object({ id: z.number(), lat: z.number(), long: z.number() }))
	.mutation(async ({ input }) => {
		console.log("Call API POST trpc/drivers.updatePosition");

		const result = await updatePositionUsecase.execute(input as any);

		console.log("Complete API POST trpc/drivers.updatePosition");
		return result;
	});
