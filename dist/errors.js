"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSizeError = exports.LockError = exports.ValidationError = exports.FileNotFoundError = exports.DatabaseError = void 0;
class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class FileNotFoundError extends DatabaseError {
    constructor(filePath) {
        super(`File not found: ${filePath}`);
        this.name = 'FileNotFoundError';
    }
}
exports.FileNotFoundError = FileNotFoundError;
class ValidationError extends DatabaseError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class LockError extends DatabaseError {
    constructor(message) {
        super(message);
        this.name = 'LockError';
    }
}
exports.LockError = LockError;
class FileSizeError extends DatabaseError {
    constructor(filePath, size, maxSize) {
        super(`File ${filePath} size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`);
        this.name = 'FileSizeError';
    }
}
exports.FileSizeError = FileSizeError;
