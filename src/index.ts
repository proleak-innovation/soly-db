import * as fs from 'fs/promises';
import { z } from 'zod';
import sanitize from 'sanitize-filename';
import * as lockfile from 'proper-lockfile';
import { ConfigManager } from './config';
import { BackupManager } from './backup';
import {
  DatabaseError,
  FileNotFoundError,
  ValidationError,
  LockError,
  FileSizeError,
} from './errors';

export class Database {
  private config = ConfigManager.getInstance();
  private backup = BackupManager.getInstance();

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const config = this.config.getConfig();
    try {
      await fs.access(config.dataDirectory);
    } catch {
      await fs.mkdir(config.dataDirectory, { recursive: true });
    }

    if (config.backupEnabled) {
      this.backup.startAutoBackup();
    }
  }

  private validateFilename(filename: string): string {
    const sanitized = sanitize(filename);
    if (!sanitized) {
      throw new ValidationError('Invalid filename');
    }
    if (!filename.endsWith('.json')) {
      return `${sanitized}.json`;
    }
    return sanitized;
  }

  public async read<T>(
    filename: string,
    schema?: z.ZodType<T>
  ): Promise<T[]> {
    const sanitizedFilename = this.validateFilename(filename);
    const fullPath = this.config.getDataPath(sanitizedFilename);

    try {
      await fs.access(fullPath);
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const data = JSON.parse(fileContent) as T[];

      if (schema) {
        return schema.array().parse(data);
      }

      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.writeFile(fullPath, '[]', 'utf8');
        return [];
      }
      throw new DatabaseError(`Failed to read file: ${error}`);
    }
  }

  public async save<T>(
    filename: string,
    data: T[],
    schema?: z.ZodType<T>
  ): Promise<void> {
    const sanitizedFilename = this.validateFilename(filename);
    const fullPath = this.config.getDataPath(sanitizedFilename);
    const config = this.config.getConfig();

    if (schema) {
      schema.array().parse(data);
    }

    const jsonData = JSON.stringify(data, null, 2);
    if (Buffer.byteLength(jsonData) > config.maxFileSize) {
      throw new FileSizeError(
        fullPath,
        Buffer.byteLength(jsonData),
        config.maxFileSize
      );
    }

    try {
      // Acquire a lock before writing
      const release = await lockfile.lock(fullPath);

      try {
        await fs.writeFile(fullPath, jsonData, 'utf8');
        if (config.backupEnabled) {
          await this.backup.backupFile(sanitizedFilename);
        }
      } finally {
        await release();
      }
    } catch (error) {
      // No lockfile.LockError type, so just throw LockError for any error acquiring the lock
      if (error instanceof Error) {
        throw new LockError(
          `Failed to acquire lock for ${fullPath}: ${error.message}`
        );
      }
      throw new DatabaseError(`Failed to save file: ${String(error)}`);
    }
  }

  public async delete(filename: string): Promise<void> {
    const sanitizedFilename = this.validateFilename(filename);
    const fullPath = this.config.getDataPath(sanitizedFilename);

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundError(fullPath);
      }
      throw new DatabaseError(`Failed to delete file: ${error}`);
    }
  }

  public async listFiles(): Promise<string[]> {
    const config = this.config.getConfig();
    try {
      const files = await fs.readdir(config.dataDirectory);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      throw new DatabaseError(`Failed to list files: ${error}`);
    }
  }

  public async getBackups(filename: string): Promise<string[]> {
    return this.backup.listBackups(filename);
  }

  public async restoreFromBackup(
    backupPath: string,
    targetFilename: string
  ): Promise<void> {
    const sanitizedFilename = this.validateFilename(targetFilename);
    await this.backup.restoreFromBackup(backupPath, sanitizedFilename);
  }
}

// Re-export types and utilities
export { ConfigManager } from './config';
export { BackupManager } from './backup';
export * from './errors';
export type { Config } from './config'; 