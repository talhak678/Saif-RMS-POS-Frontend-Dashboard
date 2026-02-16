import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./permission.service";
import { iPermission } from "@/types/auth.types";
import Loader from "@/components/ui/spinner";
import { NavItem, navItems } from "@/lib/data/sidebar-items";

interface ProtectedRouteProps {
    module?: string;
    component?: boolean;
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, module, component }) => {
    const { user, permissions } = useAuth()
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                if (module) {
                    if (permissions && permissions.length > 0) {
                        const access = permissions.find((item: iPermission) => item.action === module);
                        if (!access) {
                            setHasAccess(false);
                            setLoading(false);
                            if (!component) {
                                router.push("/not-found", { scroll: true });
                            }
                        }
                        else {
                            setHasAccess(true);
                            setLoading(false);
                        }
                    }
                }

                else {
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

        checkLoginStatus();
    }, [router, permissions]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center`}>
                <Loader size={'12'} />
            </div>
        );
    }

    return user && hasAccess ? children : null;
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
