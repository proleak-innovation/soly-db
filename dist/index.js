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
exports.save = exports.read = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dataDirectory = './data';
const ensureDataDirectoryExists = () => {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
    }
};
const read = (filePath) => {
    ensureDataDirectoryExists();
    const fullPath = path.join(dataDirectory, filePath);
    try {
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, JSON.stringify([], null, 2), 'utf8');
        }
        const fileData = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(fileData);
    }
    catch (err) {
        console.error(fullPath, err);
        return [];
    }
};
exports.read = read;
const save = (filePath, data) => {
    ensureDataDirectoryExists();
    const fullPath = path.join(dataDirectory, filePath);
    try {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
    }
    catch (err) {
        console.error(fullPath, err);
    }
};
exports.save = save;
