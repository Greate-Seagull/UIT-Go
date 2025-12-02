import { z } from "zod";

/**
 * Recursively build a Prisma `select` object from a Zod schema.
 * Includes all fields from the schema. Nested objects are handled recursively.
 */
export function buildQuery(schema: any) {
	if (!(schema instanceof z.ZodObject)) return true; // primitives → select all

	const shape = schema.shape;
	let select: any = {};

	for (const key of Object.keys(shape)) {
		let field = shape[key];
		field = unwrap(field);

		if (field instanceof z.ZodObject) {
			select[key] = { select: buildQuery(field) };
		} else if (field instanceof z.ZodArray) {
			select[key] = { select: buildQuery(field.element) };
		} else {
			select[key] = true;
		}
	}

	return select;
}

export function unwrap(field: any) {
	const type = ["optional", "nullable", "default"];
	while (type.includes(field.type)) {
		field = field.unwrap();
	}
	return field;
}

export function toPersistence(entity: any, withRelations: boolean = false) {
	if (!entity) return null;
	const { id, ...persistable } = entity;

	let result: any = {};
	for (const [key, value] of Object.entries(persistable)) {
		const r = dispatcher(value, withRelations);
		if (!r) continue;
		result[key] = r;
	}

	return result;

	function dispatcher(value: any, withRelations: any) {
		if (!value) return null;
		if (isPrimitive(value)) return toPersistenceNonContainer(value);

		if (!withRelations) return null;
		if (isContainer(value)) return toPersistenceContainer(value);

		return null;
	}

	function isPrimitive(value: any) {
		return ["string", "number", "boolean"].includes(typeof value);
	}

	function isContainer(value: any) {
		return Array.isArray(value);
	}

	function toPersistenceNonContainer(value: any) {
		return value;
	}

	function toPersistenceContainer(value: any) {
		if (!value.length) return null;
		return {
			connectOrCreate: value.map((v: any) => ({
				where: {
					id: v.id,
				},
				create: toPersistence(v),
			})),
		};
	}
}
