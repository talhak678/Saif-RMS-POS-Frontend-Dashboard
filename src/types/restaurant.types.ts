import { iBaseDTO, statusEnum } from "./base.types"

export interface iRestaurant extends iBaseDTO {
    id?: string,
    name: string,
    slug: string,
    logo?: string,
    description?: string,
    status: statusEnum,
    subscription: string,
    facebookUrl?: string,
    instagramUrl?: string,
    tiktokUrl?: string,
    metaPixelId: number,
}