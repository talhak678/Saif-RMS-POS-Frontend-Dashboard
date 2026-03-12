import { ZodSchema } from "zod";
import { EncryptionService } from "./encrypt.service";
import { iValidationError } from "@/types/base.types";
import { format } from 'date-fns'

export type ErrorMap<T> = Partial<Record<keyof T, string>>;

class BaseService extends EncryptionService {
    private static baseInstance: BaseService;

    public static getInstance(): BaseService {
        if (!BaseService.baseInstance) {
            BaseService.baseInstance = new BaseService();
        }
        return BaseService.baseInstance;
    }

    // function to get cookie item
    protected getCookie(name: string): string | undefined | null {
        if (typeof document === 'undefined') return null;
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // helper function to serialize data to parse in params
    public serializeData(obj: any): string {
        const str = [];

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key].trim()) {
                str.push(
                    encodeURIComponent(key) + "=" + encodeURIComponent(obj[key].trim())
                );
            }
        }

        return str.length ? `?${str.join("&")}` : "";
    };

    // helper function to set cookie
    public setCookie(
        name: string,
        value: string,
        expiry: number = 1
    ): void {
        const expires = new Date();
        expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isLocalhost) {
            // Localhost HTTP: Minimal flags to avoid browser security blocks
            document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
        } else {
            // Production HTTPS: Standard secure flags
            document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Lax`;
        }
    };

    public getTodayDateInfo = (userDate?: Date): { day: string, formattedDate: string, year: number } => {
        const date = userDate ? new Date(userDate) : new Date();

        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayNumber = date.getDate();
        const year = date.getFullYear()

        const getOrdinal = (n: number) => {
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        const month = date.toLocaleDateString("en-US", { month: "long" });

        const formattedDate = `${dayNumber}${getOrdinal(dayNumber)} ${month}`;

        return { day, formattedDate, year }
    }

    public timeAgo = (date: Date | string): string => {
        const now = Date.now();
        const then = new Date(date).getTime();
        const seconds = Math.floor((now - then) / 1000);

        const intervals: {
            label: Intl.RelativeTimeFormatUnit;
            seconds: number;
        }[] = [
                { label: 'year', seconds: 31536000 },
                { label: 'month', seconds: 2592000 },
                { label: 'day', seconds: 86400 },
                { label: 'hour', seconds: 3600 },
                { label: 'minute', seconds: 60 },
                { label: 'second', seconds: 1 },
            ];

        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return rtf.format(-count, interval.label);
            }
        }

        return 'just now';
    };

    private isValidDate(value: unknown): value is Date {
        return value instanceof Date && !isNaN(value.getTime());
    }

    public isRequiredFilled<T extends object>(
        data: T,
        requiredFields: (keyof T)[]
    ): boolean {
        return requiredFields.every(field => {
            const value = (data as any)[field];

            if (value === null || value === undefined) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            if (value instanceof Date && !this.isValidDate(value)) return false;

            return true;
        });
    }

    public getRequiredFieldErrors<T extends object>(
        data: T,
        requiredFields: (keyof T)[]
    ): iValidationError<T>[] {
        const errors: iValidationError<T>[] = []

        requiredFields.forEach(field => {
            const value = (data as any)[field]

            if (value === null || value === undefined) {
                errors.push({
                    field,
                    error: `${String(field)} is required`,
                })
                return
            }

            if (typeof value === "string" && value.trim() === "") {
                errors.push({
                    field,
                    error: `${String(field)} is required`,
                })
                return
            }

            if (value instanceof Date && !this.isValidDate(value)) {
                errors.push({
                    field,
                    error: `${String(field)} must be a valid date`,
                })
                return
            }
        })

        return errors
    }

    public redirectToLogin(url?: string): void {
        window.location.replace(url || '/signin');
    }

    public getEncryptedCookie(name: string): string | null {
        const encryptedValue = this.getCookie(name);
        if (encryptedValue) {
            const decoded = decodeURIComponent(encryptedValue);
            const decrypted = this.decryptField(decoded);
            return decrypted
        }
        return null;
    }

    public setEncryptedCookie(name: string, value: any): void {
        const encrypted = this.encryptField(value);
        const encoded = encodeURIComponent(encrypted);
        this.setCookie(name, encoded);
    }

    public deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    public deleteAllCookies(): void {
        if (typeof document === 'undefined') return;
        const cookies = document.cookie.split(";");
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        for (const cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (isLocalhost) {
                document.cookie = name + `=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            } else {
                document.cookie = name + `=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Lax`;
            }
        }
    }

    public zodValidate = <T extends Record<string, any>>(
        schema: ZodSchema<T>,
        data: T
    ): { success: true; data: T } | { success: false; data: ErrorMap<T> } => {
        const result = schema.safeParse(data);

        if (result.success) {
            return { success: true, data: result.data };
        }

        const errors: ErrorMap<T> = {};

        result.error.issues.forEach((err) => {
            const field = err.path[0] as keyof T;
            errors[field] = err.message;
        });

        return { success: false, data: errors };
    };
}

export { BaseService };
export const BaseServiceInstance = () => BaseService.getInstance();

export function formatDate(date: Date | string): string {
    if (!date) return '---'

    return new Date(date).toLocaleDateString('en-CA')

}

export const getTodayDateInfo = (userDate?: Date): { day: string, formattedDate: string, year: number } => {
    const date = userDate ? new Date(userDate) : new Date();

    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = date.getDate();
    const year = date.getFullYear()

    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return "th";
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const month = date.toLocaleDateString("en-US", { month: "long" });

    const formattedDate = `${dayNumber}${getOrdinal(dayNumber)} ${month}`;

    return { day, formattedDate, year }
}

export const formatCurrency = (number: number): string => {
    if (!number) return '0'
    const formatted = Intl.NumberFormat().format(number)
    return formatted
}

export function formatTime(time: string): string {
    const formatTime = new Date(`1970-01-01T${time}`)
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    return formatTime
}

export const formatDateTime = (date: Date) =>
    format(date, "yyyy-MM-dd'T'HH:mm:ss");