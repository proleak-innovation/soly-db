export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
    required?: boolean;
    validate?: (value: any) => boolean;
}
export interface Schema {
    [key: string]: SchemaField;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const read: <T>(filePath: string) => T[];
export declare const readWithSchema: <T>(filePath: string, schema?: Schema) => {
    data: T[];
    validation: ValidationResult;
};
export declare const save: <T>(filePath: string, data: T[]) => void;
export declare const saveWithSchema: <T>(filePath: string, data: T[], schema?: Schema, options?: {
    strict?: boolean;
    skipInvalid?: boolean;
}) => ValidationResult;
export declare const createSchema: (fields: {
    [key: string]: Omit<SchemaField, "type"> & {
        type: SchemaField["type"];
    };
}) => Schema;
export declare const validateItem: (item: any, schema: Schema) => ValidationResult;
