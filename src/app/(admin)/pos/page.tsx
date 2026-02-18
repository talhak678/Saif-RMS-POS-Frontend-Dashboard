"use client";

import { useState } from "react";
import {
    Coffee,
    Soup,
    UtensilsCrossed,
    ChefHat,
    Beef,
    LayoutGrid,
    Plus,
    Minus,
    Wallet,
    CreditCard,
    QrCode,
    Leaf,
    Drumstick,
} from "lucide-react";
import { categories, menuItems, activeOrders, MenuItem } from "@/data/mockMenuData";

type OrderType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD" | "QR";

interface CartItem extends MenuItem {
    quantity: number;
}

const iconMap: Record<string, any> = {
    LayoutGrid,
    Coffee,
    Soup,
    UtensilsCrossed,
    ChefHat,
    Beef,
};

export default function POSPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

    // Filter menu items by category
    const filteredItems =
        selectedCategory === "all"
            ? menuItems
            : menuItems.filter((item) => item.category === selectedCategory);

    // Add item to cart
    const addToCart = (item: MenuItem) => {
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
            setCart(
                cart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
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

    // Calculate totals
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Get cart item quantity
    const getCartQuantity = (itemId: string) => {
        return cart.find((item) => item.id === itemId)?.quantity || 0;
    };

    // Place order
    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        alert(`Order placed successfully!\nTotal: Rs. ${total.toFixed(2)}\nPayment: ${paymentMethod}`);
        setCart([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Section - Products (70%) */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    {/* Category Navigation */}
                    <div className="mb-4 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                            {categories.map((category) => {
                                const Icon = iconMap[category.icon];
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex flex-col items-center justify-center min-w-[100px] p-3 rounded-xl transition-all ${selectedCategory === category.id
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <Icon className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">{category.name}</span>
                                        <span className="text-[10px] opacity-75">
                                            {category.id === "all"
                                                ? `${menuItems.length} items`
                                                : `${menuItems.filter((i) => i.category === category.id).length} items`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item) => {
                                const quantity = getCartQuantity(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        {/* Product Image */}
                                        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Veg/Non-Veg Badge */}
                                            <div className="absolute top-2 right-2">
                                                {item.isVeg ? (
                                                    <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded">
                                                        <Leaf className="w-4 h-4 text-green-600 dark:text-green-300" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-100 dark:bg-red-900 p-1.5 rounded">
                                                        <Drumstick className="w-4 h-4 text-red-600 dark:text-red-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-3">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                                                Rs. {item.price}
                                            </p>

                                            {/* Add to Cart / Quantity Controls */}
                                            {quantity === 0 ? (
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Add to Dish
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
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
                    </div>
                </div>

                {/* Right Section - Cart Sidebar (30%) */}
                <div className="w-full md:w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
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
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${orderType === type
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
                                <LayoutGrid className="w-16 h-16 mb-2 opacity-50" />
                                <p className="text-sm">Cart is empty</p>
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
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Rs. {item.price} × {item.quantity}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                Rs. {item.price * item.quantity}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded text-white hover:bg-blue-700"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
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
                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${paymentMethod === method
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
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Orders Footer */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Active Orders
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {activeOrders.map((order) => (
                        <div
                            key={order.id}
                            className="min-w-[200px] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                    {order.tableNumber}
                                </span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
