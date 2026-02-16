import { jwtDecode } from 'jwt-decode'
import { BaseService } from "./base.service";
import { iAPIErrorRes, iApiResponse } from "@/types/base.types";
import { endpoints } from "@/types/environment";
import api from "./api";
import { iPermission, iRole } from '@/types/auth.types';

// Role service
class RoleService extends BaseService {
    private static RoleInstance: RoleService;

    public static getInstance(): RoleService {
        if (!RoleService.RoleInstance) {
            RoleService.RoleInstance = new RoleService();
        }
        return RoleService.RoleInstance;
    }

    public async addRole(payload: iRole): Promise<iApiResponse> {
        try {
            const res = await api.post<iApiResponse>(endpoints.addRole, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async updateRole(payload: iRole): Promise<iApiResponse> {
        try {
            const res = await api.put<iApiResponse>(endpoints.editRole, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async deleteRole(RoleId: string): Promise<iApiResponse> {
        try {
            const res = await api.delete<iApiResponse>(`${endpoints.deleteRole}${RoleId}`)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async getRoles(): Promise<iApiResponse> {
        try {
            const res = await api.get<iApiResponse>(endpoints.getRoles)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async addPermission(payload: iPermission): Promise<iApiResponse> {
        try {
            const res = await api.post<iApiResponse>(endpoints.addPermission, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async updatePermission(payload: iPermission): Promise<iApiResponse> {
        try {
            const res = await api.put<iApiResponse>(endpoints.editPermission, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async deletePermission(PermissionId: string): Promise<iApiResponse> {
        try {
            const res = await api.delete<iApiResponse>(`${endpoints.deletePermission}${PermissionId}`)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async getPermissions(): Promise<iApiResponse> {
        try {
            const res = await api.get<iApiResponse>(endpoints.getPermissions)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }
}

export { RoleService }
export const RoleServiceInstance = () => RoleService.getInstance();

