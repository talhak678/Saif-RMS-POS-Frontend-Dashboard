import CryptoJS from 'crypto-js';

export class EncryptionService {
    private secretKey: string;

    constructor(secretKey?: string) {
        this.secretKey = secretKey || process.env.NEXT_PUBLIC_ENC_STORAGE_KEY || 'secret_key';
    }

    decryptField(encryptedValue: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                return ''
            }

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }

    encryptField(value: string): string {
        return CryptoJS.AES.encrypt(String(value), this.secretKey).toString();
    }

    /** Encrypt a full JS object */
    encryptObject(obj: Record<string, any>): Record<string, any> {
        const encryptedObj: Record<string, any> = {};

        for (const key in obj) {
            const value = obj[key];

            if (typeof value === 'string') {
                encryptedObj[key] = this.encryptField(value);
            } else if (Array.isArray(value)) {
                encryptedObj[key] = this.encryptArray(value);
            } else if (typeof value === 'object' && value !== null) {
                encryptedObj[key] = this.encryptObject(value);
            } else {
                encryptedObj[key] = value; // numbers, booleans, null remain same
            }
        }

        return encryptedObj;
    }

    /** Decrypt a full JS object */
    decryptObject(obj: Record<string, any>): Record<string, any> {
        const decryptedObj: Record<string, any> = {};

        for (const key in obj) {
            const value = obj[key];

            if (typeof value === 'string') {
                decryptedObj[key] = this.decryptField(value);
            } else if (Array.isArray(value)) {
                decryptedObj[key] = this.decryptArray(value);
            } else if (typeof value === 'object' && value !== null) {
                decryptedObj[key] = this.decryptObject(value);
            } else {
                decryptedObj[key] = value;
            }
        }

        return decryptedObj;
    }

    /** Encrypt array */
    encryptArray(arr: any[]): any[] {
        return arr.map(item => {
            if (typeof item === 'string') {
                return this.encryptField(item);
            } else if (Array.isArray(item)) {
                return this.encryptArray(item);
            } else if (typeof item === 'object' && item !== null) {
                return this.encryptObject(item);
            }
            return item; // numbers, booleans remain same
        });
    }

    /** Decrypt array */
    decryptArray(arr: any[]): any[] {
        return arr.map(item => {
            if (typeof item === 'string') {
                return this.decryptField(item);
            } else if (Array.isArray(item)) {
                return this.decryptArray(item);
            } else if (typeof item === 'object' && item !== null) {
                return this.decryptObject(item);
            }
            return item;
        });
    }
}

class EncryptionServiceSingleton {
    private static instance: EncryptionService;

    static getInstance(): EncryptionService {
        if (!this.instance) {
            const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '3214543643';
            this.instance = new EncryptionService(secretKey);
        }
        return this.instance;
    }
}

export const getEncryptionService = () => EncryptionServiceSingleton.getInstance();
