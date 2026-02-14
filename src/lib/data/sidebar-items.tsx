import { GridIcon, Shield, ShoppingCart, Users } from "lucide-react";

export type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    required?: boolean,
    subItems?: NavItem[],
    action: string,
};

export const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        // subItems: [{ name: "Ecommerce", path: "/", pro: false }],
        path: "/",
        action: 'dashboard'
    },
    {
        icon: <ShoppingCart className="w-5 h-5" />,
        name: "Orders",
        path: "/orders",
        action: 'orders'
    },
    {
        icon: <Users className="w-5 h-5" />,
        name: "Customers",
        path: "/customers",
        action: 'customers'
    },
    {
        icon: <Shield />,
        name: "Authentication",
        action: 'authentication',
        subItems: [
            { name: "Users", path: "/users", action: 'users', },
            { name: "Roles", path: "/roles", action: 'rolse' },
        ],
    },
];