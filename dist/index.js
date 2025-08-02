"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateItem = exports.createSchema = exports.saveWithSchema = exports.save = exports.readWithSchema = exports.read = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dataDirectory = './data';
// Type validation functions
const validateType = (value, expectedType) => {
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
const validateData = (data, schema) => {
    if (!schema) {
        return { isValid: true, errors: [] };
    }
    const allErrors = [];
    data.forEach((item, index) => {
        const result = (0, exports.validateItem)(item, schema);
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
const isValidFileName = (fileName) => {
    // Only allow alphanumeric, dash, underscore, and .json extension
    return /^[a-zA-Z0-9_-]+\.json$/.test(fileName);
};
const sanitizeFilePath = (filePath) => {
    // Prevent path traversal
    const base = path.resolve(dataDirectory);
    const target = path.resolve(dataDirectory, filePath);
    if (!target.startsWith(base)) {
        throw new Error('Invalid file path');
    }
    return path.basename(target);
};
const ensureDataDirectoryExists = () => {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { mode: 0o700 });
    }
};
// Original read function (without schema validation)
const read = (filePath) => {
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
        if (!Array.isArray(parsed))
            throw new Error('Data is not an array');
        return parsed;
    }
    catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Read error:', err);
        }
        else {
            console.error('Read error');
        }
        return [];
    }
};
exports.read = read;
// Enhanced read function with optional schema validation
const readWithSchema = (filePath, schema) => {
    const data = (0, exports.read)(filePath);
    const validation = validateData(data, schema);
    if (schema && !validation.isValid) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Schema validation failed:', validation.errors);
        }
    }
    return { data, validation };
};
exports.readWithSchema = readWithSchema;
// Original save function (without schema validation)
const save = (filePath, data) => {
    ensureDataDirectoryExists();
    if (!isValidFileName(filePath)) {
        throw new Error('Invalid file name');
    }
    const safeFile = sanitizeFilePath(filePath);
    const fullPath = path.join(dataDirectory, safeFile);
    try {
        if (!Array.isArray(data))
            throw new Error('Data must be an array');
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
    }
    catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Save error:', err);
        }
        else {
            console.error('Save error');
        }
    }
};
exports.save = save;
// Enhanced save function with optional schema validation
const saveWithSchema = (filePath, data, schema, options) => {
    const validation = validateData(data, schema);
    const { strict = false, skipInvalid = false } = options || {};
    if (schema && !validation.isValid) {
        if (strict) {
            throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
        }
        if (skipInvalid) {
            // Filter out invalid items
            const validData = data.filter((item, index) => {
                const itemValidation = (0, exports.validateItem)(item, schema);
                return itemValidation.isValid;
            });
            (0, exports.save)(filePath, validData);
            return validation;
        }
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Schema validation failed but saving anyway:', validation.errors);
        }
    }
    (0, exports.save)(filePath, data);
    return validation;
};
exports.saveWithSchema = saveWithSchema;
// Helper function to create schema
const createSchema = (fields) => {
    return fields;
};
exports.createSchema = createSchema;
// Utility function to validate single item against schema
const validateItem = (item, schema) => {
    const errors = [];
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
exports.validateItem = validateItem;
