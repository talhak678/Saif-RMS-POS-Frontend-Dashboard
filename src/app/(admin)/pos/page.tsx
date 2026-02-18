"use client";

import { useState, useEffect } from "react";
import {
    LayoutGrid,
    Plus,
    Minus,
    Wallet,
    CreditCard,
    QrCode,
    ShoppingCart,
    Loader2,
} from "lucide-react";
import api from "@/services/api";
import { activeOrders } from "@/data/mockMenuData";

type OrderType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD" | "QR";

interface Category {
    id: string;
    name: string;
    _count?: { menuItems: number };
}

interface Variation {
    id: string;
    name: string;
    price: string;
}

interface Addon {
    id: string;
    name: string;
    price: string;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    isAvailable: boolean;
    categoryId: string;
    category?: { name: string };
    variations: Variation[];
    addons: Addon[];
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

export default function POSPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

    // API Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingItems, setLoadingItems] = useState(true);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const res = await api.get("/categories");
                if (res.data?.success) {
                    setCategories(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch menu items when category changes
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoadingItems(true);
                const query =
                    selectedCategory !== "all"
                        ? `?categoryId=${selectedCategory}`
                        : "";
                const res = await api.get(`/menu-items${query}`);
                if (res.data?.success) {
                    setMenuItems(
                        res.data.data.filter((item: MenuItem) => item.isAvailable)
                    );
                }
            } catch (err) {
                console.error("Failed to fetch menu items", err);
            } finally {
                setLoadingItems(false);
            }
        };
        fetchMenuItems();
    }, [selectedCategory]);

    // Add item to cart
    const addToCart = (item: MenuItem) => {
        const price = parseFloat(item.price);
        const existingItem = cart.find((c) => c.id === item.id);
        if (existingItem) {
            setCart(
                cart.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    id: item.id,
                    name: item.name,
                    price,
                    image: item.image,
                    quantity: 1,
                },
            ]);
        }
    };

    // Update quantity
    const updateQuantity = (id: string, delta: number) => {
        setCart(
            cart
                .map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity + delta } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Get cart item quantity
    const getCartQuantity = (itemId: string) =>
        cart.find((item) => item.id === itemId)?.quantity || 0;

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Place order
    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        alert(
            `Order placed successfully!\nTotal: Rs. ${total.toFixed(2)}\nPayment: ${paymentMethod}`
        );
        setCart([]);
    };

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Section - Products (70%) */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
                    {/* Category Navigation */}
                    <div className="mb-4 overflow-x-auto flex-shrink-0">
                        {loadingCategories ? (
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="min-w-[100px] h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-2 pb-2">
                                {/* All Tab */}
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`flex flex-col items-center justify-center min-w-[100px] p-3 rounded-xl transition-all ${selectedCategory === "all"
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <LayoutGrid className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-medium">All</span>
                                    <span className="text-[10px] opacity-75">
                                        {menuItems.length} items
                                    </span>
                                </button>

                                {/* Dynamic Categories */}
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex flex-col items-center justify-center min-w-[110px] p-3 rounded-xl transition-all ${selectedCategory === category.id
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <ShoppingCart className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium text-center leading-tight">
                                            {category.name}
                                        </span>
                                        <span className="text-[10px] opacity-75">
                                            {category._count?.menuItems || 0} items
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingItems ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse"
                                    >
                                        <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                                        <div className="p-3 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ShoppingCart className="w-16 h-16 mb-2 opacity-30" />
                                <p className="text-sm">No items found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {menuItems.map((item) => {
                                    const quantity = getCartQuantity(item.id);
                                    const price = parseFloat(item.price);
                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                                        >
                                            {/* Product Image */}
                                            <div className="relative h-40 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                                                    }}
                                                />
                                                {/* Variations badge */}
                                                {item.variations.length > 0 && (
                                                    <div className="absolute top-2 left-2">
                                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                            {item.variations.length} sizes
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info - flex-col with flex-1 to push button down */}
                                            <div className="p-3 flex flex-col flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2 flex-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-3">
                                                    Rs. {price}
                                                </p>

                                                {/* Add to Cart / Quantity Controls - always at bottom */}
                                                {quantity === 0 ? (
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Add to Dish
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-1.5">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section - Cart Sidebar (30%) */}
                <div className="w-[360px] flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Order Type Toggle */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            {[
                                { type: "DINE_IN" as OrderType, label: "Dine In" },
                                { type: "TAKE_AWAY" as OrderType, label: "Take Away" },
                                { type: "DELIVERY" as OrderType, label: "Delivery" },
                            ].map(({ type, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type)}
                                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${orderType === type
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ShoppingCart className="w-16 h-16 mb-2 opacity-30" />
                                <p className="text-sm">Cart is empty</p>
                                <p className="text-xs mt-1">Add items from the menu</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Rs. {item.price} × {item.quantity}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                Rs. {(item.price * item.quantity).toFixed(0)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded text-white hover:bg-blue-700"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <span className="text-center text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bill Summary */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Sub Total</span>
                                <span>Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Tax (5%)</span>
                                <span>Rs. {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span>Total Amount</span>
                                <span>Rs. {total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Payment Method
                            </p>
                            <div className="flex gap-2">
                                {[
                                    { method: "CASH" as PaymentMethod, icon: Wallet, label: "Cash" },
                                    { method: "CARD" as PaymentMethod, icon: CreditCard, label: "Card" },
                                    { method: "QR" as PaymentMethod, icon: QrCode, label: "QR Code" },
                                ].map(({ method, icon: Icon, label }) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${paymentMethod === method
                                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${paymentMethod === method
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-500 dark:text-gray-400"
                                                }`}
                                        />
                                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Place Order
                            {cart.length > 0 && (
                                <span className="bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Orders Footer */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Active Orders
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {activeOrders.map((order) => (
                        <div
                            key={order.id}
                            className="min-w-[180px] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2.5"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                    {order.tableNumber}
                                </span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {order.customerName}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {order.itemCount} items • {order.status}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
