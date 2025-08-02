import * as fs from 'fs';
import * as path from 'path';

const dataDirectory = './data';

// Schema definition types
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

// Type validation functions
const validateType = (value: any, expectedType: string): boolean => {
    switch (expectedType) {
        case 'string': return typeof value === 'string';
        case 'number': return typeof value === 'number' && !isNaN(value);
        case 'boolean': return typeof value === 'boolean';
        case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
        case 'array': return Array.isArray(value);
        case 'any': return true;
        default: return false;
    }
};

const validateData = (data: any[], schema?: Schema): ValidationResult => {
    if (!schema) {
        return { isValid: true, errors: [] };
    }
    
    const allErrors: string[] = [];
    
    data.forEach((item, index) => {
        const result = validateItem(item, schema);
        if (!result.isValid) {
            result.errors.forEach(error => {
                allErrors.push(`Item ${index}: ${error}`);
            });
        }
    });
    
    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
};

const isValidFileName = (fileName: string): boolean => {
    // Only allow alphanumeric, dash, underscore, and .json extension
    return /^[a-zA-Z0-9_-]+\.json$/.test(fileName);
};

const sanitizeFilePath = (filePath: string): string => {
    // Prevent path traversal
    const base = path.resolve(dataDirectory);
    const target = path.resolve(dataDirectory, filePath);
    if (!target.startsWith(base)) {
        throw new Error('Invalid file path');
    }
    return path.basename(target);
};

const ensureDataDirectoryExists = (): void => {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { mode: 0o700 });
    }
};

// Original read function (without schema validation)
export const read = <T>(filePath: string): T[] => {
    ensureDataDirectoryExists();
    if (!isValidFileName(filePath)) {
        throw new Error('Invalid file name');
    }
    const safeFile = sanitizeFilePath(filePath);
    const fullPath = path.join(dataDirectory, safeFile);
    try {
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, JSON.stringify([], null, 2), { encoding: 'utf8', mode: 0o600 });
        }
        const fileData = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(fileData);
        if (!Array.isArray(parsed)) throw new Error('Data is not an array');
        return parsed as T[];
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Read error:', err);
        } else {
            console.error('Read error');
        }
        return [];
    }
};

// Enhanced read function with optional schema validation
export const readWithSchema = <T>(filePath: string, schema?: Schema): { data: T[]; validation: ValidationResult } => {
    const data = read<T>(filePath);
    const validation = validateData(data, schema);
    
    if (schema && !validation.isValid) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Schema validation failed:', validation.errors);
        }
    }
    
    return { data, validation };
};

// Original save function (without schema validation)
export const save = <T>(filePath: string, data: T[]): void => {
    ensureDataDirectoryExists();
    if (!isValidFileName(filePath)) {
        throw new Error('Invalid file name');
    }
    const safeFile = sanitizeFilePath(filePath);
    const fullPath = path.join(dataDirectory, safeFile);
    try {
        if (!Array.isArray(data)) throw new Error('Data must be an array');
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Save error:', err);
        } else {
            console.error('Save error');
        }
    }
};

// Enhanced save function with optional schema validation
export const saveWithSchema = <T>(filePath: string, data: T[], schema?: Schema, options?: { 
    strict?: boolean; // If true, throw error on validation failure
    skipInvalid?: boolean; // If true, save only valid items
}): ValidationResult => {
    const validation = validateData(data, schema);
    const { strict = false, skipInvalid = false } = options || {};
    
    if (schema && !validation.isValid) {
        if (strict) {
            throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
        }
        
        if (skipInvalid) {
            // Filter out invalid items
            const validData = data.filter((item, index) => {
                const itemValidation = validateItem(item, schema);
                return itemValidation.isValid;
            });
            save(filePath, validData);
            return validation;
        }
        
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Schema validation failed but saving anyway:', validation.errors);
        }
    }
    
    save(filePath, data);
    return validation;
};

// Helper function to create schema
export const createSchema = (fields: { [key: string]: Omit<SchemaField, 'type'> & { type: SchemaField['type'] } }): Schema => {
    return fields as Schema;
};

// Utility function to validate single item against schema
export const validateItem = (item: any, schema: Schema): ValidationResult => {
    const errors: string[] = [];
    
    // Check required fields
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        if (fieldSchema.required && (item[fieldName] === undefined || item[fieldName] === null)) {
            errors.push(`Field '${fieldName}' is required`);
            continue;
        }
        
        // Skip validation if field doesn't exist and is not required
        if (item[fieldName] === undefined || item[fieldName] === null) {
            continue;
        }
        
        // Type validation
        if (!validateType(item[fieldName], fieldSchema.type)) {
            errors.push(`Field '${fieldName}' must be of type '${fieldSchema.type}'`);
        }
        
        // Custom validation
        if (fieldSchema.validate && !fieldSchema.validate(item[fieldName])) {
            errors.push(`Field '${fieldName}' failed custom validation`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}; 