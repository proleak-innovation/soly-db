export declare class DatabaseError extends Error {
    constructor(message: string);
}
export declare class FileNotFoundError extends DatabaseError {
    constructor(filePath: string);
}
export declare class ValidationError extends DatabaseError {
    constructor(message: string);
}
export declare class LockError extends DatabaseError {
    constructor(message: string);
}
export declare class FileSizeError extends DatabaseError {
    constructor(filePath: string, size: number, maxSize: number);
}
