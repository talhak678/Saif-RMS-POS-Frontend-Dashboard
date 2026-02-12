"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  Layers, 
  PlusCircle,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

function ItemDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id; // URL se ID utha rahe hain

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/menu-items/${id}`);
      if (res.data?.success) {
        setItem(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 animate-pulse text-lg">Loading details...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 text-gray-500 gap-4">
        <p>Item not found.</p>
        <Link href="/items" className="text-blue-600 hover:underline">
          Go back to Menu
        </Link>
      </div>
    );
  }

  return (
      <div className="max-w-5xl bg-blend-transparent mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/items"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Item Details
            </h1>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              <Edit size={16} /> Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: IMAGE & STATUS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Image Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-2">
              <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                    <span className="text-sm mt-2">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Category Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              
              {/* Status */}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                <div className={`mt-1 flex items-center gap-2 font-medium ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {item.isAvailable ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  {item.isAvailable ? "Available" : "Unavailable"}
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

              {/* Category */}
              <div>
                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
                 <div className="mt-1 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Utensils size={18} className="text-blue-500" />
                    <span>{item.category?.name || "Uncategorized"}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS, VARIATIONS, ADDONS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 uppercase">Base Price</span>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Rs. {item.price}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Variations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-orange-500" />
                  Variations
                </h3>
                
                {item.variations.length > 0 ? (
                  <div className="space-y-3">
                    {item.variations.map((v: any) => (
                      <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{v.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">Rs. {v.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic min-h-[100px] border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
                    No variations available
                  </div>
                )}
              </div>

              {/* Addons */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <PlusCircle size={20} className="text-purple-500" />
                  Addons
                </h3>

                {item.addons.length > 0 ? (
                  <div className="space-y-3">
                    {item.addons.map((addon: any) => (
                      <div key={addon.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{addon.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">+ Rs. {addon.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic min-h-[100px] border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
                    No addons available
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
  );
}

// WRAPPER COMPONENT FOR SUSPENSE
export default function ItemDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-gray-900 text-gray-500">Loading Page...</div>}>
      <ItemDetails />
    </Suspense>
  );
}