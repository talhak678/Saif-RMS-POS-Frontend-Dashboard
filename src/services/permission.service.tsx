import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthServiceInstance } from './auth.service';
import { iPermission, iUser } from '@/types/auth.types';
import { toast } from 'sonner';

interface AuthContextType {
    permissions: iPermission[] | null
    modulesLoaded: boolean;
    setModulesLoaded: (value: boolean) => void;
    user: iUser | null,
    loadingUser: boolean,
}

const AuthContext = createContext<AuthContextType>({
    permissions: null,
    modulesLoaded: false,
    loadingUser: false,
    setModulesLoaded: () => { },
    user: null
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
                setUser(res?.data);
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
            <AuthContext.Provider value={{ permissions, user, loadingUser, modulesLoaded, setModulesLoaded }}>
                {children}
            </AuthContext.Provider>
        </>
    );
};

export const useAuth = () => useContext(AuthContext);
