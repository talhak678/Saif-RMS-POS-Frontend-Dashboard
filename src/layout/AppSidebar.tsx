"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings, ChefHat, ShoppingCartIcon, Warehouse, Bike, Motorbike, TicketPercent, Computer } from "lucide-react";
import { ShoppingCart, Users, ShieldCheck, Shield } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/services/permission.service";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  subItems?: { name: string; permission?: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    permission: "dashboard", // Parent permission (optional, we check children mostly)
    subItems: [
      { name: "Overview", path: "/overview-dashboard", pro: false, permission: "dashboard:overview" },
      { name: "Reports", path: "/reports-dashboard", pro: true, permission: "dashboard:reports" },
    ],
    path: "/",
  },
  {
    icon: <ListIcon className="w-5 h-5" />,
    name: "Customers & Orders",
    subItems: [
      { name: "Incoming Orders", path: "/incoming-orders", pro: false, permission: "customers-orders:incoming-orders" },
      { name: "Customers", path: "/customers", pro: false, permission: "customers-orders:customers" },
      { name: "Orders History", path: "/orders", pro: false, permission: "customers-orders:orders-history" },
    ],
  },
  {
    icon: <Computer className="w-5 h-5" />,
    name: "Point of Sale (POS)",
    subItems: [
      { name: "Menu", path: "/pos", pro: false, permission: "pos:menu" },
      { name: "Reservations", path: "/reservations", pro: false, permission: "pos:reservations" },
      { name: "Table Services", path: "/table-services", pro: false, permission: "pos:table-services" },
    ],
  },
  {
    icon: <ChefHat className="w-5 h-5" />,
    name: "Restaurant Config",
    subItems: [
      { name: "Restaurants", path: "/restaurants", pro: false, permission: "restaurant-config:restaurants" },
      { name: "Branches", path: "/branches", pro: false, permission: "restaurant-config:branches" },
    ],
  },
  {
    icon: <GridIcon className="w-5 h-5" />,
    name: "Menu & Categories",
    subItems: [
      { name: "Categories", path: "/categories", pro: false, permission: "menu-management:categories" },
      { name: "Items", path: "/items", pro: false, permission: "menu-management:items" },
    ],
  },
  {
    icon: <Motorbike className="w-5 h-5" />,
    name: "Delivery & Support",
    subItems: [
      { name: "Riders", path: "/riders", pro: false, permission: "delivery-support:riders" },
    ],
  },
  {
    icon: <Warehouse className="w-5 h-5" />,
    name: "Inventory & Recipes",
    subItems: [
      { name: "Ingredients", path: "/ingredients", pro: false, permission: "inventory-recipes:ingredients" },
      { name: "Stock", path: "/stock", pro: false, permission: "inventory-recipes:stock" },
      { name: "Recipes", path: "/recipes", pro: false, permission: "inventory-recipes:recipes" },
    ],
  },
  {
    icon: <TicketPercent className="w-5 h-5" />,
    name: "Marketing & Loyalty",
    subItems: [
      { name: "Discounts", path: "/discounts", pro: false, permission: "marketing-loyalty:discounts" },
      { name: "Reviews", path: "/reviews", pro: false, permission: "marketing-loyalty:reviews" },
      { name: "Loyalty", path: "/loyalty", pro: false, permission: "marketing-loyalty:loyalty" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Users", path: "/users", pro: false, permission: "authentication:users" },
      { name: "Roles", path: "/role", pro: false, permission: "authentication:roles" },
    ],
  },
  {
    icon: <PageIcon />,
    name: "CMS & Website",
    subItems: [
      { name: "Page Sections", path: "/cms", pro: false, permission: "cms-website:page-sections" },
      { name: "Banners", path: "/cms/banners", pro: false, permission: "cms-website:banners" },
      { name: "FAQs", path: "/cms/faqs", pro: false, permission: "cms-website:faqs" },
    ],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    name: "Settings",
    path: "/settings",
    permission: "settings:all",
  },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     { name: "Images", path: "/images", pro: false },
  //     { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { permissions, loadingUser, user } = useAuth();
  const pathname = usePathname();

  // Helper function to check if a permission exists
  const hasPermission = useCallback((permission?: string) => {
    if (!permission) return true; // Items without permission field are public (usually none here but just in case)
    return permissions?.some(p => p.action === permission);
  }, [permissions]);

  // Filter items based on permissions
  const filteredNavItems = useMemo(() => {
    return navItems.map(item => {
      // If item has subItems, filter them first
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(sub => hasPermission(sub.permission));

        // Parent should be visible if:
        // 1. It has at least one accessible sub-item
        // 2. OR it has a direct permission which is granted (for cases like "Settings")
        const canShowParent = filteredSubItems.length > 0 || (item.permission && hasPermission(item.permission));

        if (!canShowParent) {
          return null;
        }
        return { ...item, subItems: filteredSubItems };
      }
      // If no subItems, just check direct permission
      // If no permission specified, it's public
      return !item.permission || hasPermission(item.permission) ? item : null;
    }).filter(Boolean) as (NavItem & { permission?: string })[];
  }, [hasPermission]);

  const renderMenuItems = (
    navItems: (NavItem & { permission?: string })[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed top-4 left-3 bottom-4 flex flex-col px-5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl text-gray-900 h-[calc(100vh-32px)] transition-all duration-300 ease-in-out z-50 border border-gray-200/50 dark:border-gray-800/50 shadow-xl rounded-[1.5rem]
        ${isExpanded || isMobileOpen
          ? "w-[330px]"
          : isHovered
            ? "w-[330px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                src="/images/authentication-images/logo-black.png"
                alt="Logo"
                width={150}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/images/authentication-images/logo-white.png"
                alt="Logo"
                width={150}
                height={40}
                className="hidden dark:block"
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {/* Profile Section
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="mx-5 mb-6 flex items-center gap-3 rounded-2xl bg-gray-100/50 p-4 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800/50">
            <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-brand-500 text-sm font-bold text-white uppercase dark:border-gray-800 shadow-sm">
              {user?.name ? (
                user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
              ) : (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">
                {user?.name || "Guest User"}
              </h3>
              <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                {user?.role?.name || "No Role"}
              </p>
            </div>
          </div>
        )} */}

        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
