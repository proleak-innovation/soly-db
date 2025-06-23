# Soly DB

A simple, safe, and efficient JSON file-based database with TypeScript support.

## Features

- 🔒 Thread-safe file operations with proper locking
- 🔍 Type-safe data validation using Zod schemas
- 🔄 Automatic backup system
- 🛡️ Path sanitization and security checks
- ⚡ Async/await API
- 📝 TypeScript support
- 🚫 File size limits
- 🗄️ Backup management

## Installation

```bash
npm install soly-db
```

## Usage

### Basic Usage

```typescript
import { Database } from 'soly-db';

const db = new Database();

// Define your data type
interface User {
  id: number;
  name: string;
  email: string;
}

// Read data
const users = await db.read<User>('users.json');

// Save data
await db.save<User>('users.json', [
  { id: 1, name: 'John', email: 'john@example.com' }
]);
```

### With Schema Validation

```typescript
import { Database } from 'soly-db';
import { z } from 'zod';

const db = new Database();

// Define schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

// Read with validation
const users = await db.read('users.json', UserSchema);

// Save with validation
await db.save('users.json', newUsers, UserSchema);
```

### Backup Management

```typescript
// List backups
const backups = await db.getBackups('users.json');

// Restore from backup
await db.restoreFromBackup('users_2024-02-25.json', 'users.json');
```

### Configuration

```typescript
import { ConfigManager } from 'soly-db';

const config = ConfigManager.getInstance();

config.updateConfig({
  dataDirectory: './custom-data',
  maxFileSize: 1024 * 1024 * 20, // 20MB
  backupEnabled: true,
  backupInterval: 1000 * 60 * 60 // 1 hour
});
```

## API Reference

### Database Class

- `read<T>(filename: string, schema?: ZodType<T>): Promise<T[]>`
- `save<T>(filename: string, data: T[], schema?: ZodType<T>): Promise<void>`
- `delete(filename: string): Promise<void>`
- `listFiles(): Promise<string[]>`
- `getBackups(filename: string): Promise<string[]>`
- `restoreFromBackup(backupPath: string, targetFilename: string): Promise<void>`

### Configuration

Default configuration:
```typescript
{
  dataDirectory: './data',
  maxFileSize: 10MB,
  lockTimeout: 5000, // 5 seconds
  backupEnabled: true,
  backupDirectory: './backups',
  backupInterval: 24 hours
}
```

## Error Handling

The library throws specific error types:
- `DatabaseError`: Base error class
- `FileNotFoundError`: File not found
- `ValidationError`: Schema validation failed
- `LockError`: Failed to acquire file lock
- `FileSizeError`: File size exceeds limit

```typescript
try {
  await db.save('users.json', data);
} catch (error) {
  if (error instanceof FileNotFoundError) {
    // Handle file not found
  } else if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

## License
ISC

---

**soly-db** is an open-source project by [PROLEAK Innovation](https://proleak.com) and [JOB Multiver](https://jobmultiver.com). Contributions and feedback are welcome! 