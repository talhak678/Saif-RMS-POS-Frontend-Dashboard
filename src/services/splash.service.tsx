import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./permission.service";
import { useModules } from "./modules.service";
import Loader from "@/components/ui/spinner";

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const SplashService: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, permissions } = useAuth()
    const { modulesLoaded } = useModules()
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    useEffect(() => {
        const checkModulesStatus = async () => {
            try {
                if (modulesLoaded) {
                    setHasAccess(true);
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
                if (module) {
                    router.push("/not-found", { scroll: true });
                }
                else {
                    router.push("/signin", { scroll: true });
                }
            }
        };

        checkModulesStatus();
    }, [router, permissions, user, modulesLoaded]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center`}>
                <Loader size={'12'} />
            </div>
        );
    }

    return modulesLoaded && hasAccess ? children : null;
};

export default SplashService;


