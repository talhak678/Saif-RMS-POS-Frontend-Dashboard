
import { iToken, iUser } from "@/types/auth.types";
import { jwtDecode } from 'jwt-decode'
import { BaseService } from "./base.service";
import { iAPIErrorRes, iApiResponse } from "@/types/base.types";
import { endpoints } from "@/types/environment";
import api from "./api";

// auth service
class AuthService extends BaseService {
    private static authInstance: AuthService;

    public static getInstance(): AuthService {
        if (!AuthService.authInstance) {
            AuthService.authInstance = new AuthService();
        }
        return AuthService.authInstance;
    }

    // function to check is user logged in or not
    public getAuthStates(): { token: string | null, status: boolean } {
        const token = this.getEncryptedCookie('token')

        if (!token) {
            return { token: null, status: false }
        }
        return { token: token, status: true }
    }

    // function to get current user's id
    public getCurrentUserId(): string | null {
        const authStates = this.getAuthStates()
        if (!authStates.status || !authStates.token) {
            return null
        }
        else {
            const decodedToken = this.decryptToken(authStates.token)
            return decodedToken.UserId
        }
    }

    // function to logout
    public logout(): void {
        this.redirectToLogin()
        this.logout()
    }

    public async login(credentials: { email: string, password: string }): Promise<iApiResponse> {
        try {
            const res = await api.post<iApiResponse>(endpoints.login, credentials)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async logoutUser(): Promise<iApiResponse> {
        try {
            const res = await api.post<iApiResponse>(endpoints.logout)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async addUser(payload: iUser): Promise<iApiResponse> {
        try {
            const res = await api.post<iApiResponse>(endpoints.addUser, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async updateUser(payload: iUser): Promise<iApiResponse> {
        try {
            const res = await api.put<iApiResponse>(endpoints.editUser, payload)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async deleteUser(userId: string): Promise<iApiResponse> {
        try {
            const res = await api.delete<iApiResponse>(`${endpoints.deleteUser}${userId}`)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async getUsers(restaurantId?: string): Promise<iApiResponse> {
        try {
            const res = await api.get<iApiResponse>(`${endpoints.getUsers}${restaurantId ?
                this.serializeData(
                    {
                        restaurantId
                    }
                )
                :
                ''
                }`)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public async getCurrentUser(): Promise<iApiResponse> {
        try {
            const res = await api.get<iApiResponse>(endpoints.getCurrentUser)
            return res.data
        } catch (e: iAPIErrorRes | any) {
            console.error(e)
            return e.response.data
        }
    }

    public decryptToken(token: string): iToken {
        return jwtDecode<iToken>(token)
    }
}

export { AuthService }
export const AuthServiceInstance = () => AuthService.getInstance();

