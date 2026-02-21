import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthServiceInstance } from './auth.service';
import { iPermission, iUser } from '@/types/auth.types';
import { toast } from 'sonner';

interface AuthContextType {
    permissions: iPermission[] | null
    modulesLoaded: boolean;
    setModulesLoaded: (value: boolean) => void;
    user: iUser | null;
    loadingUser: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    permissions: null,
    modulesLoaded: false,
    loadingUser: false,
    setModulesLoaded: () => { },
    user: null,
    refreshUser: async () => { }
});

export const AuthProvider = ({ children }: { children: any }) => {
    const [permissions, setPermissions] = useState<iPermission[] | null>(null);
    const [modulesLoaded, setModulesLoaded] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [user, setUser] = useState<iUser | null>(null);
    const router = useRouter()
    const authServ = AuthServiceInstance()

    const getCurrentUser = async () => {
        try {
            setLoadingUser(true)
            const res = await authServ.getCurrentUser();
            if (res?.success) {
                const userData = res?.data;
                const isSuperAdminOnly = process.env.NEXT_PUBLIC_IS_SUPER_ADMIN_ONLY === 'true';
                const isSuperAdmin = userData?.role?.name === 'SUPER_ADMIN';

                // 1. Super Admin Exclusivity Check
                if (isSuperAdminOnly && !isSuperAdmin) {
                    toast.error('This url is for support team.');
                    authServ.logout();
                    return;
                }
                //check on normal url superadmin cannot login
                if (!isSuperAdminOnly && isSuperAdmin) {
                    toast.error('You are not authorized to access this url.');
                    authServ.logout();
                    return;
                }

                // 2. Restaurant Status Check
                if (userData?.restaurant && userData.restaurant.status !== 'ACTIVE') {
                    toast.error(`Your Restaurent is ${userData.restaurant.status.toLowerCase()}. Please contact support.`);
                    authServ.logout();
                    return;
                }

                setUser(userData);
                setPermissions(userData?.role?.permissions || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch user details')
                authServ.logout()
            }
        } catch (error) {
            console.error("Failed to fetch user details", error);
        } finally {
            setLoadingUser(false);
        }
    }

    useEffect(() => {
        getCurrentUser()
    }, [router])

    return (
        <>
            <AuthContext.Provider value={{ permissions, user, loadingUser, modulesLoaded, setModulesLoaded, refreshUser: getCurrentUser }}>
                {children}
            </AuthContext.Provider>
        </>
    );
};

export const useAuth = () => useContext(AuthContext);
