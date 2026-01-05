"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuery = buildQuery;
exports.unwrap = unwrap;
exports.toPersistence = toPersistence;
const zod_1 = require("zod");
/**
 * Recursively build a Prisma `select` object from a Zod schema.
 * Includes all fields from the schema. Nested objects are handled recursively.
 */
function buildQuery(schema) {
    if (!(schema instanceof zod_1.z.ZodObject))
        return true; // primitives → select all
    const shape = schema.shape;
    let select = {};
    for (const key of Object.keys(shape)) {
        let field = shape[key];
        field = unwrap(field);
        if (field instanceof zod_1.z.ZodObject) {
            select[key] = { select: buildQuery(field) };
        }
        else if (field instanceof zod_1.z.ZodArray) {
            select[key] = { select: buildQuery(field.element) };
        }
        else {
            select[key] = true;
        }
    }
    return select;
}
function unwrap(field) {
    const type = ["optional", "nullable", "default"];
    while (type.includes(field.type)) {
        field = field.unwrap();
    }
    return field;
}
function toPersistence(entity, withRelations = false) {
    if (!entity)
        return null;
    const { id, ...persistable } = entity;
    let result = {};
    for (const [key, value] of Object.entries(persistable)) {
        const r = dispatcher(value, withRelations);
        if (!r)
            continue;
        result[key] = r;
    }
    return result;
    function dispatcher(value, withRelations) {
        if (!value)
            return null;
        if (isPrimitive(value))
            return toPersistenceNonContainer(value);
        if (!withRelations)
            return null;
        if (isContainer(value))
            return toPersistenceContainer(value);
        return null;
    }
    function isPrimitive(value) {
        return ["string", "number", "boolean"].includes(typeof value);
    }
    function isContainer(value) {
        return Array.isArray(value);
    }
    function toPersistenceNonContainer(value) {
        return value;
    }
    function toPersistenceContainer(value) {
        if (!value.length)
            return null;
        return {
            connectOrCreate: value.map((v) => ({
                where: {
                    id: v.id,
                },
                create: toPersistence(v),
            })),
        };
    }
}
//# sourceMappingURL=buildSqlQuery.js.map