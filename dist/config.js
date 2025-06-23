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
exports.ConfigManager = exports.ConfigSchema = exports.DEFAULT_CONFIG = void 0;
const path = __importStar(require("path"));
const zod_1 = require("zod");
exports.DEFAULT_CONFIG = {
    dataDirectory: './data',
    maxFileSize: 1024 * 1024 * 10, // 10MB
    lockTimeout: 5000, // 5 seconds
    backupEnabled: true,
    backupDirectory: './backups',
    backupInterval: 1000 * 60 * 60 * 24, // 24 hours
};
// Zod schema for validating configuration
exports.ConfigSchema = zod_1.z.object({
    dataDirectory: zod_1.z.string(),
    maxFileSize: zod_1.z.number().positive(),
    lockTimeout: zod_1.z.number().positive(),
    backupEnabled: zod_1.z.boolean(),
    backupDirectory: zod_1.z.string(),
    backupInterval: zod_1.z.number().positive(),
});
class ConfigManager {
    constructor() {
        this.config = exports.DEFAULT_CONFIG;
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    updateConfig(partialConfig) {
        const newConfig = { ...this.config, ...partialConfig };
        const validatedConfig = exports.ConfigSchema.parse(newConfig);
        this.config = validatedConfig;
    }
    getDataPath(filePath) {
        return path.join(this.config.dataDirectory, filePath);
    }
    getBackupPath(filePath) {
        return path.join(this.config.backupDirectory, filePath);
    }
}
exports.ConfigManager = ConfigManager;
