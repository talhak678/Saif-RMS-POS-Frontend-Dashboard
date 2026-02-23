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
    X,
    User,
    Phone,
    MapPin,
    ChevronRight,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/services/protected-route";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

type OrderType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD" | "COD";

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
    basePrice: number;
    image: string;
    quantity: number;
    selectedVariation?: Variation;
    selectedAddons: Addon[];
    unitPrice: number; // base + variation diff + addons
}

interface CustomerDetails {
    name: string;
    phone: string;
    address: string;
    tableNumber: string;
}

interface Branch {
    id: string;
    name: string;
}

// ─── Item Selection Modal ─────────────────────────────────────────────────────
function ItemSelectionModal({
    item,
    onClose,
    onAddToCart,
}: {
    item: MenuItem;
    onClose: () => void;
    onAddToCart: (item: MenuItem, variation: Variation | undefined, addons: Addon[]) => void;
}) {
    const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
        item.variations.length > 0 ? item.variations[0] : undefined
    );
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

    const basePrice = parseFloat(item.price);
    const variationPrice = selectedVariation ? parseFloat(selectedVariation.price) : basePrice;
    const addonsTotal = selectedAddons.reduce((s, a) => s + parseFloat(a.price), 0);
    const totalPrice = variationPrice + addonsTotal;

    const toggleAddon = (addon: Addon) => {
        setSelectedAddons((prev) =>
            prev.find((a) => a.id === addon.id)
                ? prev.filter((a) => a.id !== addon.id)
                : [...prev, addon]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Image */}
                <div className="relative h-48">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                        }}
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 hover:bg-white"
                    >
                        <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                    </div>

                    {/* Variations */}
                    {item.variations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select Size / Variation
                            </h3>
                            <div className="space-y-2">
                                {item.variations.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariation(v)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedVariation?.id === v.id
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedVariation?.id === v.id
                                                    ? "border-blue-600"
                                                    : "border-gray-400"
                                                    }`}
                                            >
                                                {selectedVariation?.id === v.id && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {v.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            Rs. {parseFloat(v.price)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Addons */}
                    {item.addons.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Add-ons (Optional)
                            </h3>
                            <div className="space-y-2">
                                {item.addons.map((addon) => {
                                    const selected = selectedAddons.find((a) => a.id === addon.id);
                                    return (
                                        <button
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selected
                                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-gray-400"
                                                        }`}
                                                >
                                                    {selected && (
                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {addon.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                + Rs. {parseFloat(addon.price)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            Rs. {totalPrice}
                        </p>
                    </div>
                    <button
                        onClick={() => onAddToCart(item, selectedVariation, selectedAddons)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Customer Details Modal ───────────────────────────────────────────────────
function CustomerDetailsModal({
    orderType,
    branches,
    onClose,
    onConfirm,
    cart,
    subtotal,
    tax,
    total,
    paymentMethod,
}: {
    orderType: OrderType;
    branches: Branch[];
    onClose: () => void;
    onConfirm: (details: CustomerDetails, branchId: string) => void;
    cart: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
}) {
    const [details, setDetails] = useState<CustomerDetails>({
        name: "",
        phone: "",
        address: "",
        tableNumber: "",
    });
    const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isDelivery = orderType === "DELIVERY";

    const validate = () => {
        const e: Record<string, string> = {};
        if (isDelivery && !details.name.trim()) e.name = "Name is required for delivery";
        if (isDelivery && !details.phone.trim()) e.phone = "Phone is required for delivery";
        if (isDelivery && !details.address.trim()) e.address = "Address is required for delivery";
        if (!selectedBranchId) e.branch = "Please select a branch";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = () => {
        if (validate()) onConfirm(details, selectedBranchId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Order Summary & Customer Details
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Order Items ({cart.length})
                        </h3>
                        <div className="space-y-2">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div>
                                        <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                                        {item.selectedVariation && (
                                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                                                ({item.selectedVariation.name})
                                            </span>
                                        )}
                                        {item.selectedAddons.length > 0 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                + {item.selectedAddons.map((a) => a.name).join(", ")}
                                            </div>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                                            × {item.quantity}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        Rs. {(item.unitPrice * item.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3 space-y-1">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Tax (5%)</span><span>Rs. {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                                <span>Total</span><span>Rs. {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Payment</span><span>{paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Branch Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Branch <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Branch</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
                    </div>

                    {/* Customer Details */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Customer Details
                            {!isDelivery && (
                                <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                            )}
                        </h3>
                        <div className="space-y-3">
                            {/* Name */}
                            <div>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Customer Name${isDelivery ? " *" : ""}`}
                                        value={details.name}
                                        onChange={(e) => setDetails({ ...details, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder={`Phone Number${isDelivery ? " *" : ""}`}
                                        value={details.phone}
                                        onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {/* Table Number (Dine In) */}
                            {orderType === "DINE_IN" && (
                                <input
                                    type="text"
                                    placeholder="Table Number (Optional)"
                                    value={details.tableNumber}
                                    onChange={(e) => setDetails({ ...details, tableNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}

                            {/* Address (Delivery) */}
                            {isDelivery && (
                                <div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <textarea
                                            placeholder="Delivery Address *"
                                            value={details.address}
                                            onChange={(e) => setDetails({ ...details, address: e.target.value })}
                                            rows={2}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        Place Order
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Stripe Payment Components ───────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({
    clientSecret,
    amount,
    onSuccess,
    onCancel
}: {
    clientSecret: string,
    amount: number,
    onSuccess: () => void,
    onCancel: () => void
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/pos`,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An error occurred");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            toast.success("Payment Received!");
            onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    disabled={isLoading || !stripe || !elements}
                    className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : `Pay Rs. ${amount.toFixed(2)}`}
                </button>
            </div>
            {message && <div className="text-red-500 text-sm font-medium mt-4 text-center">{message}</div>}
        </form>
    );
}

function StripeModal({
    clientSecret,
    amount,
    onClose,
    onSuccess
}: {
    clientSecret: string,
    amount: number,
    onClose: () => void,
    onSuccess: () => void
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Complete Payment</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount to pay</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-gray-100">Rs. {amount.toFixed(2)}</p>
                    </div>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            amount={amount}
                            onSuccess={onSuccess}
                            onCancel={onClose}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
}

// ─── Main POS Page ────────────────────────────────────────────────────────────
export default function POSPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

    // API Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingItems, setLoadingItems] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Modal States
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    // Stripe States
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    // Fetch categories & branches on mount
    useEffect(() => {
        const fetchInit = async () => {
            try {
                const [catRes, branchRes] = await Promise.all([
                    api.get("/categories"),
                    api.get("/branches"),
                ]);
                if (catRes.data?.success) setCategories(catRes.data.data);
                if (branchRes.data?.success) {
                    // branches may be nested
                    const branchData = branchRes.data.data?.branches || branchRes.data.data || [];
                    setBranches(branchData);
                }
            } catch (err) {
                console.error("Init fetch failed", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchInit();
    }, []);

    // Fetch menu items when category changes
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoadingItems(true);
                const query = selectedCategory !== "all" ? `?categoryId=${selectedCategory}` : "";
                const res = await api.get(`/menu-items${query}`);
                if (res.data?.success) {
                    setMenuItems(res.data.data.filter((item: MenuItem) => item.isAvailable));
                }
            } catch (err) {
                console.error("Failed to fetch menu items", err);
            } finally {
                setLoadingItems(false);
            }
        };
        fetchMenuItems();
    }, [selectedCategory]);

    // Add item to cart after modal selection
    const handleAddToCart = (item: MenuItem, variation: Variation | undefined, addons: Addon[]) => {
        const basePrice = parseFloat(item.price);
        const variationPrice = variation ? parseFloat(variation.price) : basePrice;
        const addonsTotal = addons.reduce((s, a) => s + parseFloat(a.price), 0);
        const unitPrice = variationPrice + addonsTotal;

        // Unique key: item + variation combo
        const cartKey = `${item.id}-${variation?.id || "base"}`;
        const existing = cart.find((c) => c.id === cartKey);

        if (existing) {
            setCart(cart.map((c) => c.id === cartKey ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([
                ...cart,
                {
                    id: cartKey,
                    name: item.name,
                    basePrice,
                    image: item.image,
                    quantity: 1,
                    selectedVariation: variation,
                    selectedAddons: addons,
                    unitPrice,
                },
            ]);
        }
        setSelectedItem(null);
    };

    // Update quantity
    const updateQuantity = (id: string, delta: number) => {
        setCart(
            cart
                .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
                .filter((item) => item.quantity > 0)
        );
    };

    // Get cart item quantity (by item base id)
    const getCartQuantity = (itemId: string) =>
        cart.filter((c) => c.id.startsWith(itemId)).reduce((s, c) => s + c.quantity, 0);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Place order
    const handlePlaceOrder = async (customerDetails: CustomerDetails, branchId: string) => {
        try {
            setPlacingOrder(true);

            const paymentMethodMap: Record<PaymentMethod, string> = {
                CASH: "CASH",
                CARD: "STRIPE",
                COD: "COD",
            };

            const orderTypeMap: Record<OrderType, string> = {
                DINE_IN: "DINE_IN",
                TAKE_AWAY: "PICKUP",
                DELIVERY: "DELIVERY",
            };

            const payload: any = {
                branchId,
                type: orderTypeMap[orderType],
                total: parseFloat(total.toFixed(2)),
                paymentMethod: paymentMethodMap[paymentMethod],
                source: "POS",
                items: cart.map((item) => ({
                    menuItemId: item.id.split("-")[0], // strip variation suffix
                    quantity: item.quantity,
                    price: item.unitPrice,
                    ...(item.selectedVariation && { variationId: item.selectedVariation.id }),
                    ...(item.selectedAddons.length > 0 && {
                        addonIds: item.selectedAddons.map((a) => a.id),
                    }),
                })),
            };

            // Add customer details if provided
            if (customerDetails.name) payload.customerName = customerDetails.name;
            if (customerDetails.phone) payload.customerPhone = customerDetails.phone;
            if (customerDetails.address) payload.deliveryAddress = customerDetails.address;
            if (customerDetails.tableNumber) payload.tableNumber = customerDetails.tableNumber;

            const res = await api.post("/orders", payload);

            if (paymentMethod === "CARD") {
                const order = res.data.data;
                const intentRes = await api.post("/stripe-intent", {
                    orderId: order.id,
                    amount: total,
                });

                if (intentRes.data.success) {
                    setStripeClientSecret(intentRes.data.data.clientSecret);
                    setPaymentAmount(total);
                    setShowCustomerModal(false);
                } else {
                    toast.error("Failed to initiate payment. Please try again.");
                }
            } else {
                toast.success("Order placed successfully!");
                setCart([]);
                setShowCustomerModal(false);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to place order";
            toast.error(msg);
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <ProtectedRoute module="pos:menu">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* Item Selection Modal */}
                {selectedItem && (
                    <ItemSelectionModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onAddToCart={handleAddToCart}
                    />
                )}

                {/* Customer Details Modal */}
                {showCustomerModal && (
                    <CustomerDetailsModal
                        orderType={orderType}
                        branches={branches}
                        cart={cart}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        paymentMethod={paymentMethod}
                        onClose={() => setShowCustomerModal(false)}
                        onConfirm={handlePlaceOrder}
                    />
                )}

                {/* Stripe Payment Modal */}
                {stripeClientSecret && (
                    <StripeModal
                        clientSecret={stripeClientSecret}
                        amount={paymentAmount}
                        onClose={() => setStripeClientSecret(null)}
                        onSuccess={() => {
                            setStripeClientSecret(null);
                            setCart([]);
                            toast.success("Order and Payment completed!");
                        }}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Section - Products */}
                    <div className="flex-1 flex flex-col p-4 overflow-auto min-w-0">
                        {/* Category Navigation */}
                        <div className="mb-4 overflow-x-auto flex-shrink-0">
                            {loadingCategories ? (
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="min-w-[100px] h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-2 pb-2">
                                    {/* All Tab */}
                                    <button
                                        onClick={() => setSelectedCategory("all")}
                                        className={`flex flex-col items-center justify-center min-w-[100px] p-4 rounded-2xl transition-all border-2 ${selectedCategory === "all"
                                            ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100 dark:shadow-none"
                                            : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <LayoutGrid className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-bold">All Items</span>
                                        <span className={`text-[10px] ${selectedCategory === "all" ? "text-brand-100" : "opacity-75"}`}>{menuItems.length} items</span>
                                    </button>

                                    {/* Dynamic Categories */}
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`flex flex-col items-center justify-center min-w-[110px] p-4 rounded-2xl transition-all border-2 ${selectedCategory === category.id
                                                ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100 dark:shadow-none"
                                                : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <ShoppingCart className="w-6 h-6 mb-1" />
                                            <span className="text-xs font-bold text-center leading-tight">{category.name}</span>
                                            <span className={`text-[10px] ${selectedCategory === category.id ? "text-brand-100" : "opacity-75"}`}>{category._count?.menuItems || 0} items</span>
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
                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
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
                                        const isVeg = item.name.toLowerCase().includes("salad") || item.name.toLowerCase().includes("veg") || item.name.toLowerCase().includes("juice");

                                        return (
                                            <div
                                                key={item.id}
                                                className={`bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-200 border-2 flex flex-col cursor-pointer ${quantity > 0 ? "border-brand-600 shadow-brand-100 dark:shadow-none" : "border-transparent"
                                                    }`}
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                {/* Product Image */}
                                                <div className="relative h-44 w-full mb-3 flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-2xl"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src =
                                                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                                                        }}
                                                    />
                                                    {/* Discount Badge */}
                                                    {item.variations.length > 0 && (
                                                        <div className="absolute top-2 left-2 bg-accent-pink text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                                            New Deal
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex flex-col flex-1 px-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2 min-h-[40px] leading-tight">
                                                        {item.name}
                                                    </h3>

                                                    <div className="flex items-center justify-between mb-4 mt-auto">
                                                        <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                                                            Rs. {price}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 opacity-80">
                                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center p-0.5 ${isVeg ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                                                                <div className={`w-full h-full rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                                                {isVeg ? "Veg" : "Non Veg"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {quantity > 0 ? (
                                                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-1 w-full" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => updateQuantity(item.id.split("-")[0], -1)}
                                                                className="w-8 h-8 flex items-center justify-center bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-black text-sm text-gray-900 dark:text-gray-100">
                                                                {quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => setSelectedItem(item)}
                                                                className="w-8 h-8 flex items-center justify-center bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                            className="w-full bg-brand-50 hover:bg-brand-100 text-brand-600 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center uppercase tracking-wider"
                                                        >
                                                            Add to Dish
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Cart Sidebar */}
                    <div className="w-full lg:w-[360px] flex-shrink-0 bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-[50vh] lg:max-h-none">
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
                                        className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border-2 ${orderType === type
                                            ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200"
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
                                    <p className="text-xs mt-1">Click on items to add them</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
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
                                                {item.selectedVariation && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                                        {item.selectedVariation.name}
                                                    </p>
                                                )}
                                                {item.selectedAddons.length > 0 && (
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 line-clamp-1">
                                                        +{item.selectedAddons.map((a) => a.name).join(", ")}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Rs. {item.unitPrice} × {item.quantity}
                                                </p>
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                    Rs. {(item.unitPrice * item.quantity).toFixed(0)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 flex-shrink-0 items-center">
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
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Payment Method</p>
                                <div className="flex gap-2">
                                    {[
                                        { method: "CASH" as PaymentMethod, icon: Wallet, label: "Cash" },
                                        { method: "CARD" as PaymentMethod, icon: CreditCard, label: "Card" },
                                        { method: "COD" as PaymentMethod, icon: QrCode, label: "COD" },
                                    ].map(({ method, icon: Icon, label }) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${paymentMethod === method
                                                ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${paymentMethod === method ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`} />
                                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={() => {
                                    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
                                    setShowCustomerModal(true);
                                }}
                                disabled={cart.length === 0 || placingOrder}
                                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-100 dark:shadow-none"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Place Order
                                {cart.length > 0 && (
                                    <span className="bg-white text-brand-600 text-xs font-black px-2 py-1 rounded-full ml-1">
                                        {cart.reduce((sum, i) => sum + i.quantity, 0)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
