"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';


const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    return status === "ACTIVE"
        ? `${base} bg-green-100 text-green-800`
        : `${base} bg-red-100 text-red-800`;
};

const getSubscriptionBadge = (sub: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    switch (sub) {
        case "PREMIUM":
            return `${base} bg-purple-100 text-purple-800`;
        case "STANDARD":
            return `${base} bg-blue-100 text-blue-800`;
        default:
            return `${base} bg-gray-100 text-gray-800`;
    }
};

export default function RestaurantsPage() {
    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get("/restaurants");

            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                setRestaurants(sorted);
            }
        } catch (err) {
            console.error("Restaurants fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900">
            <div className="md:flex gap-1 items-center justify-between mb-6">

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Restaurants
                </h1>
                <br />
                <Link
                    href="/restaurants/new"
                    className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Adw Restaurant
                </Link>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3">Restaurant</th>
                            <th className="px-4 py-3">Subscription</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Branches</th>
                            <th className="px-4 py-3">Users</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="py-10 text-center">
                                    Loading restaurants...
                                </td>
                            </tr>
                        ) : restaurants.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-10 text-center">
                                    No restaurants found
                                </td>
                            </tr>
                        ) : (
                            restaurants.map((res: any, index: number) => (
                                <>
                                    {/* MAIN ROW */}
                                    <tr
                                        key={res.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>

                                        <td className="px-4 py-3 font-medium flex items-center gap-3">
                                            <img
                                                src={res.logo}
                                                alt={res.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <div>
                                                <div>{res.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {res.slug}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={getSubscriptionBadge(
                                                    res.subscription
                                                )}
                                            >
                                                {res.subscription}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={getStatusBadge(res.status)}
                                            >
                                                {res.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            {res._count.branches}
                                        </td>

                                        <td className="px-4 py-3">
                                            {res._count.users}
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {new Date(
                                                res.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() =>
                                                    setOpenId(
                                                        openId === res.id ? null : res.id
                                                    )
                                                }
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {res._count.branches > 0 && (
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/branches?restaurantId=${res.id}`
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1 rounded bg-blue-600 text-white flex items-center gap-1"
                                                >
                                                    View Branches
                                                    <ExternalLink size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* DETAILS DROPDOWN */}
                                    {openId === res.id && (
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <td colSpan={8} className="p-5 text-sm">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* LEFT */}
                                                    <div>
                                                        <h3 className="font-semibold mb-2">
                                                            Restaurant Details
                                                        </h3>
                                                        <p>
                                                            <b>Name:</b> {res.name}
                                                        </p>
                                                        <p>
                                                            <b>Description:</b>{" "}
                                                            {res.description}
                                                        </p>
                                                        <p>
                                                            <b>Slug:</b> {res.slug}
                                                        </p>
                                                        <p>
                                                            <b>Subscription:</b>{" "}
                                                            {res.subscription}
                                                        </p>
                                                        <p>
                                                            <b>Status:</b> {res.status}
                                                        </p>
                                                    </div>

                                                    {/* RIGHT */}
                                                    <div>
                                                        <h3 className="font-semibold mb-2">
                                                            Social & Meta
                                                        </h3>

                                                        {res.facebookUrl && (
                                                            <p>
                                                                <b>Facebook:</b>{" "}
                                                                <a
                                                                    href={res.facebookUrl}
                                                                    target="_blank"
                                                                    className="text-blue-600 underline"
                                                                >
                                                                    Link
                                                                </a>
                                                            </p>
                                                        )}

                                                        {res.instagramUrl && (
                                                            <p>
                                                                <b>Instagram:</b>{" "}
                                                                <a
                                                                    href={res.instagramUrl}
                                                                    target="_blank"
                                                                    className="text-pink-600 underline"
                                                                >
                                                                    Link
                                                                </a>
                                                            </p>
                                                        )}

                                                        {res.tiktokUrl && (
                                                            <p>
                                                                <b>TikTok:</b>{" "}
                                                                <a
                                                                    href={res.tiktokUrl}
                                                                    target="_blank"
                                                                    className="underline"
                                                                >
                                                                    Link
                                                                </a>
                                                            </p>
                                                        )}

                                                        <p>
                                                            <b>Meta Pixel ID:</b>{" "}
                                                            {res.metaPixelId || "N/A"}
                                                        </p>

                                                        <p>
                                                            <b>Created:</b>{" "}
                                                            {new Date(
                                                                res.createdAt
                                                            ).toLocaleString()}
                                                        </p>

                                                        <p>
                                                            <b>Updated:</b>{" "}
                                                            {new Date(
                                                                res.updatedAt
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
