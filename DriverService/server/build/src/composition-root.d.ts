import Redis from "ioredis";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { AcceptTripUsecase } from "./application/accept-trip.usecase";
import { UpdatePositionUsecase } from "./application/update-position.usecase";
import { CompleteTripUsecase } from "./application/complete-trip.usecase";
export declare const prisma: import("./generated/client/internal/class").PrismaClient<never, import("./generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const redis: Redis;
export declare const startAcceptingUsecase: StartAcceptingUsecase;
export declare const acceptTripUsecase: AcceptTripUsecase;
export declare const updatePositionUsecase: UpdatePositionUsecase;
export declare const completeTripUsecase: CompleteTripUsecase;
//# sourceMappingURL=composition-root.d.ts.map