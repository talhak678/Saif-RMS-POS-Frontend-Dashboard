import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./permission.service";
import { iPermission } from "@/types/auth.types";
import Loader from "@/components/common/Loader";
import { NavItem, navItems } from "@/lib/data/sidebar-items";

interface ProtectedRouteProps {
    module?: string;
    component?: boolean;
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, module, component }) => {
    const { user, permissions, loadingUser } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (loadingUser) return;

        // if (!user) {
        //     router.push("/signin");
        //     return;
        // }

        if (module) {
            const hasModuleAccess = permissions?.some((perm: iPermission) => perm.action === module);
            if (!hasModuleAccess) {
                setHasAccess(false);
                if (!component) {
                    router.push("/not-found");
                }
            } else {
                setHasAccess(true);
            }
        } else {
            setHasAccess(true);
        }
        setChecking(false);
    }, [user, permissions, module, router, loadingUser, component]);

    if (loadingUser || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <Loader size="md" />
            </div>
        );
    }

    return hasAccess ? <>{children}</> : null;
};

interface getModules {
    fetched: (fetch: NavItem[]) => void
}

export interface DecodedToken {
    userId: number;
    roles:
    {
        roleId: number,
        roleName: string
    }[]
    [key: string]: any;
}

interface ProtectedRouteProps {
    modules?: NavItem[];
    onFetched?: (modules: any[]) => void;
}

const ProtectedModules: React.FC<ProtectedRouteProps> = ({ modules, onFetched }) => {
    const { user, permissions } = useAuth()

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                if (!modules || !Array.isArray(modules)) {
                    onFetched?.([]);
                    return;
                }
                const accessibleModules: any[] = [];

                if (permissions) {
                    for (const mod of modules) {
                        if (mod.required) {
                            accessibleModules.push(mod);
                        }
                        else {
                            if (mod.subItems && Array.isArray(mod.subItems)) {
                                const accessibleSubItems = mod.subItems.filter((subItem: any) =>
                                    permissions.some((perm: iPermission) =>
                                        perm.action === subItem.module
                                    )
                                );

                                if (accessibleSubItems.length > 0) {
                                    accessibleModules.push({
                                        ...mod,
                                        subItems: accessibleSubItems
                                    });
                                }
                            } else if (mod.action) {
                                // debugger
                                const hasAccess = permissions.some((perm: iPermission) => perm.action === mod.action);
                                if (hasAccess) {
                                    accessibleModules.push(mod);
                                }
                            } else {
                                accessibleModules.push(mod);
                            }
                        }
                    }

                    onFetched?.(accessibleModules);
                }
                else {
                    return
                }
            } catch (error) {
                console.error("Error checking login status:", error);
                return
            }
        };

        checkLoginStatus();
    }, [user, permissions]);


    return null;
};

export const GetModules: React.FC<getModules> = ({ fetched }) => {
    return (
        <ProtectedModules onFetched={(modules) => fetched(modules)} modules={navItems} />
    )
}

export { ProtectedModules, ProtectedRoute }
