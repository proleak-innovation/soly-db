# soly-db

A modern, high-quality NoSQL database for Node.js and TypeScript.

---

**soly-db** is a simple, fast, and reliable file-based NoSQL database designed for developers who want an easy-to-use solution for storing structured data in JSON format. Built with TypeScript for type safety and modern development workflows.

Developed and maintained by **PROLEAK Innovation** and **JOB Multiver**.

---

## Features

- ⚡️ Blazing fast and lightweight
- 🗄️ File-based JSON storage
- 🔒 Safe and automatic file creation
- 🛡️ TypeScript support with type safety
- 🧩 Simple API for reading and writing data
- 🚀 Perfect for prototyping, small apps, and learning

## Installation

```bash
npm install soly-db
```

## Usage

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

## API

### `read<T>(filePath: string): T[]`
Reads and parses JSON data from the specified file. If the file does not exist, it will be created automatically with an empty array.

### `save<T>(filePath: string, data: T[]): void`
Writes the provided data array to the specified file in JSON format.

## Why soly-db?
- No server required, zero config
- Works out-of-the-box with Node.js and TypeScript
- Great for rapid prototyping, learning, and small projects
- Developed by experienced teams: PROLEAK Innovation & JOB Multiver

## License
ISC

---

**soly-db** is an open-source project by [PROLEAK Innovation](https://proleak.com) and [JOB Multiver](https://jobmultiver.com). Contributions and feedback are welcome! 