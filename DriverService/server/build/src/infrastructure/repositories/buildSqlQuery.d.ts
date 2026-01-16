/**
 * Recursively build a Prisma `select` object from a Zod schema.
 * Includes all fields from the schema. Nested objects are handled recursively.
 */
export declare function buildQuery(schema: any): any;
export declare function unwrap(field: any): any;
export declare function toPersistence(entity: any, withRelations?: boolean): any;
//# sourceMappingURL=buildSqlQuery.d.ts.map