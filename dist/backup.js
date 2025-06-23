"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const config_1 = require("./config");
class BackupManager {
    constructor() {
        this.config = config_1.ConfigManager.getInstance();
        this.initializeBackupDirectory();
    }
    static getInstance() {
        if (!BackupManager.instance) {
            BackupManager.instance = new BackupManager();
        }
        return BackupManager.instance;
    }
    async initializeBackupDirectory() {
        const config = this.config.getConfig();
        try {
            await fs.access(config.backupDirectory);
        }
        catch (_a) {
            await fs.mkdir(config.backupDirectory, { recursive: true });
        }
    }
    startAutoBackup() {
        const config = this.config.getConfig();
        if (!config.backupEnabled)
            return;
        this.backupInterval = setInterval(() => this.backupAll(), config.backupInterval);
    }
    stopAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
    }
    async backupAll() {
        const config = this.config.getConfig();
        try {
            const files = await fs.readdir(config.dataDirectory);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    await this.backupFile(file);
                }
            }
        }
        catch (error) {
            console.error('Backup failed:', error);
        }
    }
    async backupFile(filename) {
        const config = this.config.getConfig();
        const sourceFile = path.join(config.dataDirectory, filename);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(config.backupDirectory, `${path.parse(filename).name}_${timestamp}.json`);
        try {
            await fs.copyFile(sourceFile, backupFile);
        }
        catch (error) {
            console.error(`Failed to backup ${filename}:`, error);
        }
    }
    async restoreFromBackup(backupPath, targetFilename) {
        const config = this.config.getConfig();
        const targetPath = path.join(config.dataDirectory, targetFilename);
        try {
            await fs.copyFile(backupPath, targetPath);
        }
        catch (error) {
            console.error(`Failed to restore from backup ${backupPath}:`, error);
            throw error;
        }
    }
    async listBackups(filename) {
        const config = this.config.getConfig();
        const backups = await fs.readdir(config.backupDirectory);
        const baseFilename = path.parse(filename).name;
        return backups.filter(backup => backup.startsWith(baseFilename) && backup.endsWith('.json'));
    }
}
exports.BackupManager = BackupManager;
