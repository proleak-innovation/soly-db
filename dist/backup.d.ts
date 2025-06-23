export declare class BackupManager {
    private static instance;
    private config;
    private backupInterval?;
    private constructor();
    static getInstance(): BackupManager;
    private initializeBackupDirectory;
    startAutoBackup(): void;
    stopAutoBackup(): void;
    backupAll(): Promise<void>;
    backupFile(filename: string): Promise<void>;
    restoreFromBackup(backupPath: string, targetFilename: string): Promise<void>;
    listBackups(filename: string): Promise<string[]>;
}
