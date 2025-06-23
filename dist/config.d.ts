import { z } from 'zod';
export declare const DEFAULT_CONFIG: {
    dataDirectory: string;
    maxFileSize: number;
    lockTimeout: number;
    backupEnabled: boolean;
    backupDirectory: string;
    backupInterval: number;
};
export type Config = {
    dataDirectory: string;
    maxFileSize: number;
    lockTimeout: number;
    backupEnabled: boolean;
    backupDirectory: string;
    backupInterval: number;
};
export declare const ConfigSchema: z.ZodObject<{
    dataDirectory: z.ZodString;
    maxFileSize: z.ZodNumber;
    lockTimeout: z.ZodNumber;
    backupEnabled: z.ZodBoolean;
    backupDirectory: z.ZodString;
    backupInterval: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dataDirectory: string;
    maxFileSize: number;
    lockTimeout: number;
    backupEnabled: boolean;
    backupDirectory: string;
    backupInterval: number;
}, {
    dataDirectory: string;
    maxFileSize: number;
    lockTimeout: number;
    backupEnabled: boolean;
    backupDirectory: string;
    backupInterval: number;
}>;
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): Config;
    updateConfig(partialConfig: Partial<Config>): void;
    getDataPath(filePath: string): string;
    getBackupPath(filePath: string): string;
}
