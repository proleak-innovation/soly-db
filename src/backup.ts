import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigManager } from './config';

export class BackupManager {
  private static instance: BackupManager;
  private config = ConfigManager.getInstance();
  private backupInterval?: NodeJS.Timeout;

  private constructor() {
    this.initializeBackupDirectory();
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  private async initializeBackupDirectory(): Promise<void> {
    const config = this.config.getConfig();
    try {
      await fs.access(config.backupDirectory);
    } catch {
      await fs.mkdir(config.backupDirectory, { recursive: true });
    }
  }

  public startAutoBackup(): void {
    const config = this.config.getConfig();
    if (!config.backupEnabled) return;

    this.backupInterval = setInterval(
      () => this.backupAll(),
      config.backupInterval
    );
  }

  public stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
  }

  public async backupAll(): Promise<void> {
    const config = this.config.getConfig();
    try {
      const files = await fs.readdir(config.dataDirectory);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          await this.backupFile(file);
        }
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  public async backupFile(filename: string): Promise<void> {
    const config = this.config.getConfig();
    const sourceFile = path.join(config.dataDirectory, filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(
      config.backupDirectory,
      `${path.parse(filename).name}_${timestamp}.json`
    );

    try {
      await fs.copyFile(sourceFile, backupFile);
    } catch (error) {
      console.error(`Failed to backup ${filename}:`, error);
    }
  }

  public async restoreFromBackup(backupPath: string, targetFilename: string): Promise<void> {
    const config = this.config.getConfig();
    const targetPath = path.join(config.dataDirectory, targetFilename);

    try {
      await fs.copyFile(backupPath, targetPath);
    } catch (error) {
      console.error(`Failed to restore from backup ${backupPath}:`, error);
      throw error;
    }
  }

  public async listBackups(filename: string): Promise<string[]> {
    const config = this.config.getConfig();
    const backups = await fs.readdir(config.backupDirectory);
    const baseFilename = path.parse(filename).name;
    
    return backups.filter(backup => 
      backup.startsWith(baseFilename) && backup.endsWith('.json')
    );
  }
} 