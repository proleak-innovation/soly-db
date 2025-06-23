import * as path from 'path';
import { z } from 'zod';

export const DEFAULT_CONFIG = {
  dataDirectory: './data',
  maxFileSize: 1024 * 1024 * 10, // 10MB
  lockTimeout: 5000, // 5 seconds
  backupEnabled: true,
  backupDirectory: './backups',
  backupInterval: 1000 * 60 * 60 * 24, // 24 hours
};

export type Config = {
  dataDirectory: string;
  maxFileSize: number;
  lockTimeout: number;
  backupEnabled: boolean;
  backupDirectory: string;
  backupInterval: number;
};

// Zod schema for validating configuration
export const ConfigSchema = z.object({
  dataDirectory: z.string(),
  maxFileSize: z.number().positive(),
  lockTimeout: z.number().positive(),
  backupEnabled: z.boolean(),
  backupDirectory: z.string(),
  backupInterval: z.number().positive(),
});

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = DEFAULT_CONFIG;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  public updateConfig(partialConfig: Partial<Config>): void {
    const newConfig = { ...this.config, ...partialConfig };
    const validatedConfig = ConfigSchema.parse(newConfig);
    this.config = validatedConfig;
  }

  public getDataPath(filePath: string): string {
    return path.join(this.config.dataDirectory, filePath);
  }

  public getBackupPath(filePath: string): string {
    return path.join(this.config.backupDirectory, filePath);
  }
} 