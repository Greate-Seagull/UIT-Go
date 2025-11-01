import * as $Enums from "./enums";
import type * as Prisma from "./internal/prismaNamespace";
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type EnumDriverStateFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverState | Prisma.EnumDriverStateFieldRefInput<$PrismaModel>;
    in?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDriverStateFilter<$PrismaModel> | $Enums.DriverState;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumDriverStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverState | Prisma.EnumDriverStateFieldRefInput<$PrismaModel>;
    in?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDriverStateWithAggregatesFilter<$PrismaModel> | $Enums.DriverState;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDriverStateFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDriverStateFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedEnumDriverStateFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverState | Prisma.EnumDriverStateFieldRefInput<$PrismaModel>;
    in?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDriverStateFilter<$PrismaModel> | $Enums.DriverState;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedEnumDriverStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverState | Prisma.EnumDriverStateFieldRefInput<$PrismaModel>;
    in?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DriverState[] | Prisma.ListEnumDriverStateFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDriverStateWithAggregatesFilter<$PrismaModel> | $Enums.DriverState;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDriverStateFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDriverStateFilter<$PrismaModel>;
};
//# sourceMappingURL=commonInputTypes.d.ts.map