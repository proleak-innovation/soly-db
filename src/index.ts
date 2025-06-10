import * as fs from 'fs';
import * as path from 'path';

const dataDirectory = './data';

const ensureDataDirectoryExists = (): void => {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
    }
};

export const read = <T>(filePath: string): T[] => {
    ensureDataDirectoryExists();
    const fullPath = path.join(dataDirectory, filePath);

    try {
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, JSON.stringify([], null, 2), 'utf8');
        }

        const fileData = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(fileData) as T[];

    } catch (err) {
        console.error(fullPath, err);
        return [];
    }
};

export const save = <T>(filePath: string, data: T[]): void => {
    ensureDataDirectoryExists();
    const fullPath = path.join(dataDirectory, filePath);

    try {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(fullPath, err);
    }
}; 