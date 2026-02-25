"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save, MapPin, Search as SearchIcon, Clock, MessageSquare, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from "lucide-react";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/services/permission.service";
import { toast } from "sonner";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyAhwD5EE1C7J_K5qaqlPuBX6o0SjqJ2wYw";
const libraries: any = ["places"];
const mapContainerStyle = { width: "100%", height: "350px", borderRadius: "1.5rem" };
const centerDefault = { lat: 30.1575, lng: 66.9961 };

function EditBranchForm() {
    const { user, loadingUser } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        restaurantId: "",
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

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [restRes, branchRes] = await Promise.all([
                api.get("/restaurants"),
                api.get(`/branches/${id}`)
            ]);

            if (restRes.data?.success) {
                setRestaurants(restRes.data.data);
            }

            if (branchRes.data?.success) {
                const data = branchRes.data.data;
                setForm({
                    name: data.name || "",
                    address: data.address || "",
                    phone: data.phone || "",
                    whatsappNumber: data.whatsappNumber || "",
                    isOpen: data.isOpen !== undefined ? data.isOpen : true,
                    timing: data.timing || "",
                    deliveryRadius: Number(data.deliveryRadius) || 0,
                    freeDeliveryThreshold: Number(data.freeDeliveryThreshold) || 0,
                    deliveryCharge: Number(data.deliveryCharge) || 0,
                    deliveryOffTime: data.deliveryOffTime || '',
                    lat: Number(data.lat) || 30.1575,
                    lng: Number(data.lng) || 66.9961,
                    restaurantId: data.restaurantId || "",
                });
            }
        } catch (err) {
            console.error("Fetch data failed", err);
            toast.error("Failed to load branch details");
        } finally {
            setLoading(false);
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
            setSaving(true);
            const payload = {
                ...form,
                deliveryRadius: Number(form.deliveryRadius),
                freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
                deliveryCharge: Number(form.deliveryCharge),
                lat: Number(form.lat),
                lng: Number(form.lng)
            };
            const res = await api.put(`/branches/${id}`, payload);
            if (res.data?.success) {
                toast.success("Branch updated successfully");
                router.push(`/branches?restaurantId=${form.restaurantId}`);
            } else {
                toast.error(res.data?.message || "Failed to update branch");
            }
        } catch (err) {
            console.error("Update branch failed", err);
            toast.error("An error occurred while updating the branch");
        } finally {
            setSaving(false);
        }
    };

    if (loadingUser || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900 bg-gray-50/30">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 transition-all bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                    Edit Branch
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

                    {/* LATITUDE & LONGITUDE (MAP PREVIEW) */}
                    <div className="md:col-span-2 mt-4 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-brand-500" />
                                    Branch Pick-up Location
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Drag marker or click map to set coordinates</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-[9px] font-black text-gray-400 uppercase mr-2 tracking-tighter">LAT:</span>
                                    <span className="text-[11px] font-mono font-bold text-brand-600">{form.lat?.toFixed(6)}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-[9px] font-black text-gray-400 uppercase mr-2 tracking-tighter">LNG:</span>
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
                                                placeholder="Search location to set coordinates..."
                                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-xl outline-none text-sm font-bold text-gray-700 dark:text-gray-200 ring-4 ring-brand-500/5 focus:ring-brand-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </Autocomplete>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={{ lat: form.lat, lng: form.lng }}
                                    zoom={15}
                                    onClick={onMapClick}
                                    options={{
                                        disableDefaultUI: false,
                                        styles: [
                                            {
                                                "featureType": "all",
                                                "elementType": "labels.text.fill",
                                                "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
                                            }
                                        ]
                                    }}
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
                            <div className="h-[350px] bg-gray-100 dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-400 font-bold text-sm">Loading Google Maps...</p>
                            </div>
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
                                placeholder="+1 300 7654321"
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${form.isOpen ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                                    {form.isOpen ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-gray-100">Establishment Open Status</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{form.isOpen ? 'Branch is currently active' : 'Branch is temporarily closed'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${form.isOpen ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-gray-300 dark:bg-gray-700"}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${form.isOpen ? "translate-x-9" : "translate-x-1"}`} />
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
                        disabled={saving}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-200 dark:shadow-none flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {saving ? <Loader size="sm" showText={false} className="space-y-0" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                        {saving ? "Updating Branch..." : "Update Branch Details"}
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

export default function EditBranchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-400 dark:text-gray-500">Loading Form...</div>}>
            <EditBranchForm />
        </Suspense>
    );
}
