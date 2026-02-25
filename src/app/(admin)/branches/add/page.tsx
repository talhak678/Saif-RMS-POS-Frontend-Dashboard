"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save, MapPin, Search as SearchIcon, Clock, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/services/permission.service";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyAhwD5EE1C7J_K5qaqlPuBX6o0SjqJ2wYw";
const libraries: any = ["places"];
const mapContainerStyle = { width: "100%", height: "350px", borderRadius: "1.5rem" };
const centerDefault = { lat: 30.1575, lng: 66.9961 };

function AddBranchForm() {
    const { user, loadingUser } = useAuth();
    // const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
    const router = useRouter();
    const searchParams = useSearchParams();
    const presetRestaurantId = searchParams.get("restaurantId");

    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<any>({
        name: "",
        address: "",
        phone: "",
        whatsappNumber: "",
        isOpen: true,
        timing: "",
        deliveryRadius: 0,
        freeDeliveryThreshold: 0,
        deliveryCharge: 0,
        deliveryOffTime: '',
        lat: 30.1575,
        lng: 66.9961,
        restaurantId: presetRestaurantId || "",
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || "";
                setForm((prev: any) => ({
                    ...prev,
                    lat,
                    lng,
                    address: address || prev.address
                }));
            }
        }
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setForm((prev: any) => ({
                ...prev,
                lat: e.latLng!.lat(),
                lng: e.latLng!.lng()
            }));
        }
    };

    // useEffect(() => {
    //     if (!loadingUser && user && !isSuperAdmin) {
    //         toast.error("Access denied. Only Super Admins can add branches.");
    //         router.push("/branches");
    //     }
    // }, [user, loadingUser, isSuperAdmin, router]);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await api.get("/restaurants");
            if (res.data?.success) {
                setRestaurants(res.data.data);
            }
        } catch (err) {
            console.error("Fetch restaurants failed", err);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        const numberFields = [
            "deliveryRadius",
            "freeDeliveryThreshold",
            "deliveryCharge",
        ];

        setForm((prev: any) => ({
            ...prev,
            [name]: numberFields.includes(name)
                ? value === ""
                    ? 0
                    : Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!form.restaurantId) {
            toast.error("Please select a restaurant");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/branches", form);
            if (res.data?.success) {
                toast.success("Branch created successfully");
                router.push(`/branches?restaurantId=${form.restaurantId}`);
            } else {
                toast.error(res.data?.message || "Failed to create branch");
            }
        } catch (err) {
            console.error("Create branch failed", err);
            toast.error("An error occurred while creating the branch");
        } finally {
            setLoading(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <div className="text-gray-400">Checking permissions...</div>
            </div>
        );
    }

    // if (!isSuperAdmin) return null;

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Add Branch
                </h1>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none max-w-4xl mx-auto border border-gray-100 dark:border-gray-700"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    {/* RESTAURANT */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Restaurant *</label>
                        <select
                            name="restaurantId"
                            value={form.restaurantId}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        >
                            <option value="">Select Restaurant</option>
                            {restaurants.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BRANCH NAME */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Branch Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Phone *</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="+1 300 1234567"
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY RADIUS */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Radius (km)</label>
                        <input
                            type="number"
                            name="deliveryRadius"
                            value={form.deliveryRadius}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* FREE DELIVERY */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Free Delivery Threshold ($)</label>
                        <input
                            type="number"
                            name="freeDeliveryThreshold"
                            value={form.freeDeliveryThreshold}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY CHARGE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Charge ($)</label>
                        <input
                            type="number"
                            name="deliveryCharge"
                            value={form.deliveryCharge}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY OFF TIME */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Off Time</label>
                        <input
                            type="time"
                            name="deliveryOffTime"
                            value={form.deliveryOffTime}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* MAP SELECTION */}
                    <div className="md:col-span-2 mt-4 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-brand-500" />
                                    Branch Pick-up Location
                                </h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-[9px] font-black text-gray-400 uppercase mr-2">LAT:</span>
                                    <span className="text-[11px] font-mono font-bold text-brand-600">{form.lat?.toFixed(6)}</span>
                                </div>
                                <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-[9px] font-black text-gray-400 uppercase mr-2">LNG:</span>
                                    <span className="text-[11px] font-mono font-bold text-brand-600">{form.lng?.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>

                        {isLoaded ? (
                            <div className="relative group">
                                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                                    <div className="absolute top-4 left-4 right-4 z-10">
                                        <div className="relative flex items-center">
                                            <SearchIcon className="absolute left-4 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search location..."
                                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border shadow-xl rounded-xl outline-none text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                </Autocomplete>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={{ lat: form.lat, lng: form.lng }}
                                    zoom={14}
                                    onClick={onMapClick}
                                >
                                    <Marker
                                        position={{ lat: form.lat, lng: form.lng }}
                                        draggable={true}
                                        onDragEnd={(e) => {
                                            if (e.latLng) {
                                                setForm({ ...form, lat: e.latLng.lat(), lng: e.latLng.lng() });
                                            }
                                        }}
                                    />
                                </GoogleMap>
                            </div>
                        ) : (
                            <div className="h-[350px] bg-gray-50 rounded-2xl border-2 border-dashed flex items-center justify-center">Loading Maps...</div>
                        )}
                    </div>

                    {/* NEW FIELDS: WhatsApp, Timing, IsOpen */}
                    <div className="md:col-span-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">WhatsApp Number</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                name="whatsappNumber"
                                value={form.whatsappNumber}
                                onChange={handleChange}
                                placeholder="+92 300 7654321"
                                className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Branch Timing</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                name="timing"
                                value={form.timing}
                                onChange={handleChange}
                                placeholder="9:00 AM - 11:00 PM"
                                className="w-full pl-10 p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                {form.isOpen ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-gray-100">Branch Open Status</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{form.isOpen ? 'Branch is currently active' : 'Branch is temporarily closed'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none ${form.isOpen ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${form.isOpen ? "translate-x-8" : "translate-x-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="mt-6">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Address *</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    />
                </div>

                {/* ACTIONS */}
                <div className="mt-8 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-200 dark:shadow-none flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? <Loader size="sm" showText={false} className="space-y-0" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                        {loading ? "Creating..." : "Create Branch"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AddBranchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-400 dark:text-gray-500">Loading Form...</div>}>
            <AddBranchForm />
        </Suspense>
    );
}