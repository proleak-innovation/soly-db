# soly-db v1.5.0

A modern, high-quality NoSQL database for Node.js and TypeScript.

---

**soly-db** is a simple, fast, and reliable file-based NoSQL database designed for developers who want an easy-to-use solution for storing structured data in JSON format. Built with TypeScript for type safety and modern development workflows.

Developed and maintained by **PROLEAK Innovation** and **JMM Entertainment**.

---

## What's new in v1.5.0

- **🆕 Optional Schema Validation System**
  - Define data structure with type checking
  - Support for required/optional fields
  - Custom validation functions
  - Flexible error handling (strict mode, skip invalid data)
  - Full backward compatibility
- Enhanced security for production use (from v1.4.1)
  - Input validation for file names and data
  - Path traversal protection (sanitize file path)
  - Secure file and directory permissions (700/600)
  - Improved error handling (no sensitive info in production logs)

---

## Features

- ⚡️ Blazing fast and lightweight
- 🗄️ File-based JSON storage
- 🔒 Safe and automatic file creation
- 🛡️ TypeScript support with type safety
- 🧩 Simple API for reading and writing data
- 🚀 Perfect for prototyping, small apps, and learning
- 🛡️ **Now safer for production use!**

## Installation

```bash
npm install soly-db
```

## Usage

### Basic Usage (No Schema Validation)
```typescript
import { read, save } from 'soly-db';

interface User {
  id: number;
  name: string;
}

const users = read<User>('users.json');

const newUsers: User[] = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
];
save<User>('users.json', newUsers);
```

### Advanced Usage (With Schema Validation)
```typescript
import { readWithSchema, saveWithSchema, createSchema } from 'soly-db';

interface User {
  id: number;
  name: string;
  email?: string;
  age: number;
}

// Create schema (optional)
const userSchema = createSchema({
  id: { type: 'number', required: true },
  name: { type: 'string', required: true },
  email: { type: 'string', required: false },
  age: { 
    type: 'number', 
    required: true,
    validate: (value: number) => value >= 0 && value <= 150
  }
});

// Read with schema validation
const { data: users, validation } = readWithSchema<User>('users.json', userSchema);
if (!validation.isValid) {
  console.warn('Data validation errors:', validation.errors);
}

// Save with schema validation
const newUsers: User[] = [
  { id: 1, name: 'John', age: 25 },
  { id: 2, name: 'Jane', email: 'jane@example.com', age: 30 }
];

const saveResult = saveWithSchema('users.json', newUsers, userSchema, {
  strict: false,        // Don't throw error on validation failure
  skipInvalid: false    // Save all data even if some items are invalid
});
```

## API

### Basic Functions

#### `read<T>(filePath: string): T[]`
Reads and parses JSON data from the specified file. If the file does not exist, it will be created automatically with an empty array.
- **File name must match**: `/^[a-zA-Z0-9_-]+\.json$/`
- **Path traversal is blocked**: Only files inside the `data` directory are allowed
- **Returns**: An array of type `T`. If the file is invalid or not an array, returns an empty array.
- **Throws**: Error if file name is invalid or path is unsafe

#### `save<T>(filePath: string, data: T[]): void`
Writes the provided data array to the specified file in JSON format.
- **File name must match**: `/^[a-zA-Z0-9_-]+\.json$/`
- **Path traversal is blocked**: Only files inside the `data` directory are allowed
- **Data must be an array**
- **Throws**: Error if file name is invalid, path is unsafe, or data is not an array

### Schema Validation Functions

#### `readWithSchema<T>(filePath: string, schema?: Schema): { data: T[]; validation: ValidationResult }`
Enhanced read function with optional schema validation.
- **Returns**: Object containing data and validation result
- **Schema is optional**: Works like regular `read()` if no schema provided

#### `saveWithSchema<T>(filePath: string, data: T[], schema?: Schema, options?: SaveOptions): ValidationResult`
Enhanced save function with optional schema validation and flexible error handling.
- **Options**:
  - `strict?: boolean` - If true, throw error on validation failure (default: false)
  - `skipInvalid?: boolean` - If true, save only valid items (default: false)
- **Returns**: ValidationResult with details about validation

#### `createSchema(fields: SchemaDefinition): Schema`
Helper function to create type-safe schema definitions.

#### `validateItem(item: any, schema: Schema): ValidationResult`
Utility function to validate a single item against a schema.

### Schema Types

```typescript
interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  required?: boolean;
  validate?: (value: any) => boolean;
}

interface Schema {
  [key: string]: SchemaField;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Error Handling
- In production (`NODE_ENV=production`), error logs are generic and do **not** expose file paths or sensitive details.
- In development, detailed error logs are shown for easier debugging.

### Example: Handling Errors
```typescript
try {
  const users = read<User>('users.json');
} catch (err) {
  console.error('Failed to read users:', err);
}
```

## Security Notes
- Only `.json` files with safe names are allowed (no directory traversal)
- All files and directories are created with secure permissions (700/600)
- Do **not** use untrusted user input as file names
- Data is not encrypted by default; add encryption if storing sensitive data

## Why soly-db?
- No server required, zero config
- Works out-of-the-box with Node.js and TypeScript
- Great for rapid prototyping, learning, and small projects
- Developed by experienced teams: PROLEAK Innovation & JMM Entertainment

## License
ISC

---

**soly-db** is an open-source project by [PROLEAK Innovation](https://proleakinnovation.com) and [JMM Entertainment](https://jmmentertainment.com). Contributions and feedback are welcome! 