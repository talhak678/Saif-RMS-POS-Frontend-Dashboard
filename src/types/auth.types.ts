import z from 'zod';
import { iBaseDTO } from './base.types';
import { iRestaurant } from './restaurant.types';

export interface iUser extends iBaseDTO {
  id?: string,
  name: string,
  email: string,
  password?: string,
  roleId: string,
  restaurantId?: string,
  restaurant?: iRestaurant,
  role?: iRole
}

export interface iToken {
  userId: string,
  email: string,
  role: string,
  restaurantId?: string,
  exp: number
}

export interface iRole extends iBaseDTO {
  id?: string,
  name: string,
  permissions: iPermission[]
}

export interface iPermission extends iBaseDTO {
  id?: string,
  action: string,
}

export const UserSchema = z.object({
  id: z.string().optional().nullable(),

  name: z
    .string()
    .min(1, "Name is required"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),

  roleId: z
    .string()
    .min(1, "Role is required"),

  restaurantId: z.string().optional().nullable(),

});