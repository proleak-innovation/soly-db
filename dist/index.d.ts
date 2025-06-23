import { z } from 'zod';
export declare class Database {
    private config;
    private backup;
    constructor();
    private initializeDatabase;
    private validateFilename;
    read<T>(filename: string, schema?: z.ZodType<T>): Promise<T[]>;
    save<T>(filename: string, data: T[], schema?: z.ZodType<T>): Promise<void>;
    delete(filename: string): Promise<void>;
    listFiles(): Promise<string[]>;
    getBackups(filename: string): Promise<string[]>;
    restoreFromBackup(backupPath: string, targetFilename: string): Promise<void>;
}
export { ConfigManager } from './config';
export { BackupManager } from './backup';
export * from './errors';
export type { Config } from './config';
