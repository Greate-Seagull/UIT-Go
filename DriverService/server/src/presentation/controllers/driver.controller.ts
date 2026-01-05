import { updatePositionUsecase } from "../../composition-root";
import { trpc } from "../../trpc";
import { z } from "zod";

export const updatePositionProcedure = trpc.procedure
	.input(z.object({ id: z.number(), lat: z.number(), long: z.number() }))
	.mutation(async ({ input }) => {
		const result = await updatePositionUsecase.execute(input as any);
		return result;
	});
