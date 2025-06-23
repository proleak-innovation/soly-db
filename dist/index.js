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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = exports.ConfigManager = exports.Database = void 0;
const fs = __importStar(require("fs/promises"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const lockfile = __importStar(require("proper-lockfile"));
const config_1 = require("./config");
const backup_1 = require("./backup");
const errors_1 = require("./errors");
class Database {
    constructor() {
        this.config = config_1.ConfigManager.getInstance();
        this.backup = backup_1.BackupManager.getInstance();
        this.initializeDatabase();
    }
    async initializeDatabase() {
        const config = this.config.getConfig();
        try {
            await fs.access(config.dataDirectory);
        }
        catch (_a) {
            await fs.mkdir(config.dataDirectory, { recursive: true });
        }
        if (config.backupEnabled) {
            this.backup.startAutoBackup();
        }
    }
    validateFilename(filename) {
        const sanitized = (0, sanitize_filename_1.default)(filename);
        if (!sanitized) {
            throw new errors_1.ValidationError('Invalid filename');
        }
        if (!filename.endsWith('.json')) {
            return `${sanitized}.json`;
        }
        return sanitized;
    }
    async read(filename, schema) {
        const sanitizedFilename = this.validateFilename(filename);
        const fullPath = this.config.getDataPath(sanitizedFilename);
        try {
            await fs.access(fullPath);
            const fileContent = await fs.readFile(fullPath, 'utf8');
            const data = JSON.parse(fileContent);
            if (schema) {
                return schema.array().parse(data);
            }
            return data;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(fullPath, '[]', 'utf8');
                return [];
            }
            throw new errors_1.DatabaseError(`Failed to read file: ${error}`);
        }
    }
    async save(filename, data, schema) {
        const sanitizedFilename = this.validateFilename(filename);
        const fullPath = this.config.getDataPath(sanitizedFilename);
        const config = this.config.getConfig();
        if (schema) {
            schema.array().parse(data);
        }
        const jsonData = JSON.stringify(data, null, 2);
        if (Buffer.byteLength(jsonData) > config.maxFileSize) {
            throw new errors_1.FileSizeError(fullPath, Buffer.byteLength(jsonData), config.maxFileSize);
        }
        try {
            // Acquire a lock before writing
            const release = await lockfile.lock(fullPath);
            try {
                await fs.writeFile(fullPath, jsonData, 'utf8');
                if (config.backupEnabled) {
                    await this.backup.backupFile(sanitizedFilename);
                }
            }
            finally {
                await release();
            }
        }
        catch (error) {
            // No lockfile.LockError type, so just throw LockError for any error acquiring the lock
            if (error instanceof Error) {
                throw new errors_1.LockError(`Failed to acquire lock for ${fullPath}: ${error.message}`);
            }
            throw new errors_1.DatabaseError(`Failed to save file: ${String(error)}`);
        }
    }
    async delete(filename) {
        const sanitizedFilename = this.validateFilename(filename);
        const fullPath = this.config.getDataPath(sanitizedFilename);
        try {
            await fs.unlink(fullPath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new errors_1.FileNotFoundError(fullPath);
            }
            throw new errors_1.DatabaseError(`Failed to delete file: ${error}`);
        }
    }
    async listFiles() {
        const config = this.config.getConfig();
        try {
            const files = await fs.readdir(config.dataDirectory);
            return files.filter(file => file.endsWith('.json'));
        }
        catch (error) {
            throw new errors_1.DatabaseError(`Failed to list files: ${error}`);
        }
    }
    async getBackups(filename) {
        return this.backup.listBackups(filename);
    }
    async restoreFromBackup(backupPath, targetFilename) {
        const sanitizedFilename = this.validateFilename(targetFilename);
        await this.backup.restoreFromBackup(backupPath, sanitizedFilename);
    }
}
exports.Database = Database;
// Re-export types and utilities
var config_2 = require("./config");
Object.defineProperty(exports, "ConfigManager", { enumerable: true, get: function () { return config_2.ConfigManager; } });
var backup_2 = require("./backup");
Object.defineProperty(exports, "BackupManager", { enumerable: true, get: function () { return backup_2.BackupManager; } });
__exportStar(require("./errors"), exports);
