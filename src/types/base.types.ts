export interface iBaseDTO {
    createdAt?: Date | string,
    updatedAt?: Date | string,
}

export interface iApiResponse {
    success: boolean,
    message?: string,
    data?: any,
    error?: string
}

export interface iValidationError<T> {
    field: keyof T
    error: string
}

export interface iAPIErrorRes {
    message: string,
    name: string,
    status: number
    response: {
        data: iApiResponse,
        status: number,
    }
}

export enum statusEnum {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}