"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/services/permission.service";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Building2,
  User,
  Lock,
  MapPin,
  CreditCard,
  History,
  Save,
  Eye,
  Mail,
  Camera,
  Map as MapIcon,
  Activity,
  RefreshCw,
  CalendarDays,
  Clock,
} from "lucide-react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import MultiSelect from "@/components/form/MultiSelect";
import Loader from "@/components/common/Loader";
import ImageUpload from "@/components/common/ImageUpload";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import RenewModal from "./renew-modal";

type TabType = "RESTAURANT_INFO" | "INFO" | "LOGIN_INFO" | "MAP" | "MEMBERSHIP" | "PAYMENT_HISTORY";

const GOOGLE_MAPS_API_KEY = "AIzaSyAhwD5EE1C7J_K5qaqlPuBX6o0SjqJ2wYw";

const containerStyle = {
  width: '100%',
  height: '400px'
};

const centerDefault = {
  lat: 30.1575,
  lng: 66.9961
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("RESTAURANT_INFO");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  // Restaurant Form State
  const [restaurantForm, setRestaurantForm] = useState<any>({
    name: "",
    slug: "",
    logo: "",
    description: "",
    phone: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notificationEmail: "",
    address: "",
    city: "",
    postCode: "",
    state: "",
    country: "Pakistan",
    countryCode: "PK",
    cuisines: [],
    serviceType: "BOTH",
    status: "ACTIVE",
    lat: 30.1575,
    lng: 66.9961,
    subscription: "FREE",
    subStartDate: null,
    subEndDate: null,
    price: 0,
    billingCycle: "MONTHLY"
  });

  // User Form State
  const [userForm, setUserForm] = useState({
    name: "",
    email: ""
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Payment History State
  const [payments, setPayments] = useState<any[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
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
        setRestaurantForm((prev: any) => ({
          ...prev,
          lat,
          lng
        }));
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  useEffect(() => {
    if (user?.restaurantId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [restRes, payRes] = await Promise.all([
        api.get(`/restaurants/${user?.restaurantId}`),
        api.get(`/payments?limit=50`)
      ]);

      if (restRes.data?.success) {
        const data = restRes.data.data;

        // Determine effective plan: prioritized assigned price plan if current is FREE
        const hasPaidPlan = data.subscriptionPrices && data.subscriptionPrices.length > 0;
        const effectivePlan = (data.subscription === "FREE" && hasPaidPlan)
          ? data.subscriptionPrices[0].plan
          : (data.subscription || "FREE");

        const planPrice = data.subscriptionPrices?.find((p: any) => p.plan === effectivePlan);

        setRestaurantForm({
          name: data.name || "",
          slug: data.slug || "",
          logo: data.logo || "",
          description: data.description || "",
          phone: data.phone || "",
          contactName: data.contactName || "",
          contactPhone: data.contactPhone || "",
          contactEmail: data.contactEmail || "",
          notificationEmail: data.notificationEmail || "",
          address: data.address || "",
          city: data.city || "",
          postCode: data.postCode || "",
          state: data.state || "",
          country: data.country || "Pakistan",
          countryCode: data.countryCode || "PK",
          cuisines: data.cuisines || [],
          serviceType: data.serviceType || "BOTH",
          status: data.status || "ACTIVE",
          lat: data.lat || 30.1575,
          lng: data.lng || 66.9961,
          subscription: effectivePlan,
          subStartDate: data.subStartDate || null,
          subEndDate: data.subEndDate || null,
          price: planPrice?.price || 0,
          billingCycle: planPrice?.billingCycle || "MONTHLY"
        });
      }

      if (payRes.data?.success) {
        setPayments(payRes.data.data.payments || []);
      }

      if (user) {
        setUserForm({
          name: user.name || "",
          email: user.email || ""
        });
      }

    } catch (error) {
      console.error("Failed to fetch profile data", error);
      toast.error("Failed to load profile information");
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateRestaurant = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/restaurants/${user?.restaurantId}`, restaurantForm);
      if (res.data?.success) {
        toast.success("Restaurant information updated!");
        refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/users/${user?.id}`, {
        name: userForm.name,
        email: userForm.email
      });
      if (res.data?.success) {
        toast.success("Personal information updated!");
        refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await api.put(`/users/${user?.id}`, {
        password: passwordForm.newPassword
      });
      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setRestaurantForm((prev: any) => ({
        ...prev,
        lat: e.latLng!.lat(),
        lng: e.latLng!.lng()
      }));
    }
  }, []);

  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment?")) return;
    try {
      setLoading(true);
      const res = await api.patch("/payments", { paymentId, status: "REFUNDED" });
      if (res.data.success) {
        toast.success("Payment refunded successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Refund failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "RESTAURANT_INFO", label: "Restaurant Information", icon: <Building2 className="w-4 h-4" /> },
    { id: "INFO", label: "Information", icon: <User className="w-4 h-4" /> },
    { id: "LOGIN_INFO", label: "Login Information", icon: <Lock className="w-4 h-4" /> },
    { id: "MAP", label: "Google Map", icon: <MapIcon className="w-4 h-4" /> },
    { id: "MEMBERSHIP", label: "Membership Status", icon: <CreditCard className="w-4 h-4" /> },
    { id: "PAYMENT_HISTORY", label: "Payment History", icon: <History className="w-4 h-4" /> },
  ];

  const cuisineOptions = [
    { value: "Bakery", text: "Bakery", selected: false },
    { value: "Fast Food", text: "Fast Food", selected: false },
    { value: "Desi", text: "Desi", selected: false },
    { value: "Chinese", text: "Chinese", selected: false },
    { value: "Continental", text: "Continental", selected: false },
    { value: "Italian", text: "Italian", selected: false },
    { value: "Cafe", text: "Cafe", selected: false },
    { value: "Beverages", text: "Beverages", selected: false },
    { value: "Pizza", text: "Pizza", selected: false },
    { value: "Burgers", text: "Burgers", selected: false },
  ];

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-brand-600 dark:text-brand-400">Merchant</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-brand-600 border-gray-200">
              <History className="w-4 h-4" /> View Logs
            </Button>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex flex-wrap border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-2 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30"
                  : "text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* 1. RESTAURANT INFO */}
            {activeTab === "RESTAURANT_INFO" && (
              <div className="space-y-4 animate-in fade-in duration-500">

                <div className="flex flex-col space-y-4">
                  {/* Status Field */}
                  <div className="flex items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-1/3 md:w-1/4 font-black text-gray-700 dark:text-gray-300">Status</Label>
                    <div className="flex-1">
                      <Badge variant="solid" color={restaurantForm.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black px-3 py-1 text-[10px] rounded">
                        {restaurantForm.status || 'ACTIVE'}
                      </Badge>
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div className="flex flex-col md:flex-row md:items-start py-4 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-2 md:mb-0">Restaurant Logo</Label>
                    <div className="flex-1">
                      <ImageUpload
                        value={restaurantForm.logo}
                        onChange={(url) => setRestaurantForm({ ...restaurantForm, logo: url })}
                      />
                      <p className="mt-2 text-xs text-gray-400 italic">This logo will be displayed on your invoices and website.</p>
                    </div>
                  </div>

                  {/* Slug Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Restaurant Slug</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.slug}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, slug: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Restaurant name</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.name}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Restaurant Phone Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Restaurant phone</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.phone}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Contact Name Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Contact name</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.contactName}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, contactName: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Contact Phone Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Contact phone</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.contactPhone}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, contactPhone: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Contact Email Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Contact email</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.contactEmail}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, contactEmail: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Notification Email Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Notification email</Label>
                    <div className="flex-1 flex gap-2 items-center">
                      <Input
                        value={restaurantForm.notificationEmail}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, notificationEmail: e.target.value })}
                        className="bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex-1"
                        disabled
                      />
                      <Button variant="default" size="sm" className="bg-brand-500 hover:bg-brand-600 text-white font-bold h-10 px-4 shrink-0">
                        <Mail className="w-4 h-4 mr-2" /> Update Email
                      </Button>
                    </div>
                  </div>
                  <div className="flex md:items-center md:pb-4 border-b border-gray-50 dark:border-gray-700/50">
                    <div className="md:w-1/4"></div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      ⓘ Click the button above to update your notification email with OTP verification
                    </p>
                  </div>

                  {/* Country Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Country</Label>
                    <div className="flex-1">
                      <select
                        value={restaurantForm.country}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, country: e.target.value })}
                        className="w-full p-2.5 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50/50"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="Select Country">Select Country</option>
                      </select>
                    </div>
                  </div>

                  {/* Country Code Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Country code</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.countryCode}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, countryCode: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Street address</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.address}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                        placeholder="Masjid Rd,"
                      />
                    </div>
                  </div>

                  {/* City Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">City</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.city}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                        placeholder="Quetta"
                      />
                    </div>
                  </div>

                  {/* Post Code Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Post code/Zip code</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.postCode}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, postCode: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* State Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">State/Region</Label>
                    <div className="flex-1">
                      <Input
                        value={restaurantForm.state}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, state: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Cuisine Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-50 dark:border-gray-700/50">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-2 md:mb-0">Cuisine</Label>
                    <div className="flex-1">
                      <MultiSelect
                        label=""
                        options={cuisineOptions}
                        defaultSelected={restaurantForm.cuisines}
                        onChange={(selected) => setRestaurantForm({ ...restaurantForm, cuisines: selected })}
                      />
                    </div>
                  </div>

                  {/* Service Type Field */}
                  <div className="flex flex-col md:flex-row md:items-center py-2">
                    <Label className="w-full md:w-1/4 font-black text-gray-700 dark:text-gray-300 mb-1 md:mb-0">Pick Up or Delivery?</Label>
                    <div className="flex-1">
                      <select
                        value={restaurantForm.serviceType}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, serviceType: e.target.value })}
                        className="w-full p-2.5 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50/50"
                      >
                        <option value="DELIVERY">Delivery Only</option>
                        <option value="PICKUP">Pickup Only</option>
                        <option value="BOTH">Delivery & Pickup</option>
                      </select>
                    </div>
                  </div>

                </div>

                <div className="flex justify-center pt-8">
                  <Button onClick={handleUpdateRestaurant} disabled={loading} className="gap-2 px-16 bg-brand-500 hover:bg-brand-600 text-white font-black py-6 rounded-lg text-sm transition-all shadow-lg shadow-brand-500/20">
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}

            {/* 2. PERSONAL INFO */}
            {activeTab === "INFO" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand-100 dark:border-brand-800 shadow-xl">
                    <User className="w-12 h-12 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h2 className="text-xl font-bold dark:text-white">Admin Details</h2>
                  <p className="text-sm text-gray-500">Manage your account information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Full Name</Label>
                    <Input
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Email Address</Label>
                    <Input
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleUpdateUser} disabled={loading} className="w-full">
                      {loading ? "Updating..." : "Update Personal Info"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOGIN INFO */}
            {activeTab === "LOGIN_INFO" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-error-50 dark:bg-error-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-error-100 dark:border-error-800 shadow-xl">
                    <Lock className="w-12 h-12 text-error-600 dark:text-error-400" />
                  </div>
                  <h2 className="text-xl font-bold dark:text-white">Security Settings</h2>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleChangePassword} variant="destructive" disabled={loading} className="w-full">
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MEMBERSHIP */}
            {activeTab === "MAP" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold dark:text-white">Pin your Location</h2>
                    <p className="text-sm text-gray-500 italic">Click on the map to set your precise coordinates</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700">
                      <span className="text-xs text-gray-500 block">Latitude</span>
                      <span className="text-sm font-mono font-bold dark:text-white">{restaurantForm.lat?.toFixed(6)}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700">
                      <span className="text-xs text-gray-500 block">Longitude</span>
                      <span className="text-sm font-mono font-bold dark:text-white">{restaurantForm.lng?.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {isLoaded && (
                    <div className="relative w-full max-w-xl">
                      <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          placeholder="Search your location (e.g. City, Street, Restaurant name)..."
                          className="w-full p-3.5 pl-11 border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                        />
                      </Autocomplete>
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-brand-500" />
                    </div>
                  )}

                  <div className="rounded-3xl overflow-hidden border-2 border-brand-100 dark:border-brand-900/30 shadow-2xl relative">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={{ lat: restaurantForm.lat, lng: restaurantForm.lng }}
                        zoom={15}
                        onClick={onMapClick}
                        options={{
                          mapTypeControl: false,
                          streetViewControl: false,
                          fullscreenControl: false,
                        }}
                      >
                        <Marker position={{ lat: restaurantForm.lat, lng: restaurantForm.lng }} />
                      </GoogleMap>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                        <p>Loading Map...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button onClick={handleUpdateRestaurant} disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" /> Update Coordinates
                  </Button>
                </div>
              </div>
            )}

            {/* 5. MEMBERSHIP */}
            {activeTab === "MEMBERSHIP" && (
              <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-500">
                <div className="flex flex-col gap-6">
                  {/* Subscription Summary Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/20 dark:bg-gray-900/10">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Membership Details
                      </h3>
                      <Badge variant="solid" color={restaurantForm.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black px-4 py-1.5 rounded-lg uppercase text-[10px] tracking-widest">
                        {restaurantForm.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                      <div className="p-8 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Plan</p>
                          <div className="flex items-baseline gap-3">
                            <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase">{restaurantForm.subscription || 'FREE'}</h4>
                            <span className="text-lg font-bold text-brand-600">${restaurantForm.price} <span className="text-xs text-gray-400 font-medium capitalize">/{restaurantForm.billingCycle?.toLowerCase()}</span></span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border dark:border-gray-700">
                            <RefreshCw size={12} className="text-gray-400" /> {restaurantForm.billingCycle} BILLING
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border dark:border-gray-700">
                            <Activity size={12} className="text-emerald-500" /> {restaurantForm.status} STATUS
                          </div>
                        </div>

                        <Button
                          onClick={() => setIsRenewModalOpen(true)}
                          className="w-full md:w-fit bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black px-8 py-4 rounded-xl shadow-md border-none gap-2 text-xs hover:scale-[1.02] transition-transform"
                        >
                          Renew or Upgrade Plan
                        </Button>
                      </div>

                      <div className="p-8 space-y-6 bg-gray-50/10 dark:bg-gray-900/5">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Activation Date</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-200">
                            {restaurantForm.subStartDate ? new Date(restaurantForm.subStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Expiry Date</span>
                          <span className="text-sm font-black text-error-600">
                            {restaurantForm.subEndDate ? new Date(restaurantForm.subEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                            Your subscription is managed automatically. Please ensure your payment method is up to date to avoid service interruption.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simple Health Bar */}
                  <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Account Status: Active & Secured</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Last synced: Just now</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PAYMENT HISTORY */}
            {activeTab === "PAYMENT_HISTORY" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold dark:text-white">Recent Transactions</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Last 50 payments</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900/40">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 font-black">Date</th>
                        <th className="px-6 py-4 font-black">Order ID</th>
                        <th className="px-6 py-4 font-black">Amount</th>
                        <th className="px-6 py-4 font-black">Method</th>
                        <th className="px-6 py-4 font-black">Status</th>
                        <th className="px-6 py-4 font-black text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {payments.length > 0 ? payments.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 dark:text-gray-300 font-medium">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold dark:text-white">
                            #{p.order?.orderNo || 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-black text-brand-600 dark:text-brand-400">
                            $ {p.amount}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="light" color="info" className="uppercase text-[10px] font-black">{p.method}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="solid" color={p.status === 'PAID' ? 'success' : 'warning'} className="uppercase text-[10px] font-black">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.status === 'PAID' && (
                              <button
                                onClick={() => handleRefund(p.id)}
                                className="text-xs font-bold text-brand-600 hover:underline"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center py-20 text-gray-400 italic">No payment records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        restaurantId={user?.restaurantId || ""}
        currentPlan={restaurantForm.subscription}
      />
    </div>
  );
}
