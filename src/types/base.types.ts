export interface iBaseDTO {
    createdAt?: Date,
    udpatedAt?: Date,
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
    ACTIVE = 1,
    INACTIVE = 2,
}