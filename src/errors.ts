export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class FileNotFoundError extends DatabaseError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class LockError extends DatabaseError {
  constructor(message: string) {
    super(message);
    this.name = 'LockError';
  }
}

export class FileSizeError extends DatabaseError {
  constructor(filePath: string, size: number, maxSize: number) {
    super(`File ${filePath} size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`);
    this.name = 'FileSizeError';
  }
} 