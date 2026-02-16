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
  Image as ImageIcon,
  Save,
  X,
  Plus,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

function ItemDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  // --- STATES ---
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]); // For Dropdown
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (id) {
      fetchItemDetails();
      fetchCategories();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/menu-items/${id}`);
      if (res.data?.success) {
        setItem(res.data.data);
        // Form data ko bhi initialize karein
        setFormData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      if (res.data?.success) setCategories(res.data.data);
    } catch (e) { console.error(e); }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/menu-items/${id}`);
      router.push("/menu-items");
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete item.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- TOGGLE AVAILABILITY (Background Update) ---
  const handleToggleStatus = async () => {
    const newStatus = !formData.isAvailable;
    
    // 1. Optimistic Update
    setFormData({ ...formData, isAvailable: newStatus });
    setItem({ ...item, isAvailable: newStatus });

    // 2. API Call (Full Payload)
    try {
      await api.put(`/menu-items/${id}`, {
        ...formData,
        price: parseFloat(formData.price),
        isAvailable: newStatus,
        variations: formData.variations.map((v: any) => ({ ...v, price: parseFloat(v.price) })),
        addons: formData.addons.map((a: any) => ({ ...a, price: parseFloat(a.price) })),
      });
    } catch (error) {
      console.error("Status update failed", error);
      // Revert if failed
      setFormData({ ...formData, isAvailable: !newStatus });
      setItem({ ...item, isAvailable: !newStatus });
      alert("Failed to update status.");
    }
  };

  // --- SAVE EDIT LOGIC ---
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        categoryId: formData.categoryId, // Ensure Category ID is sent
        isAvailable: formData.isAvailable,
        variations: formData.variations.map((v: any) => ({
          name: v.name,
          price: parseFloat(v.price) || 0
        })),
        addons: formData.addons.map((a: any) => ({
          name: a.name,
          price: parseFloat(a.price) || 0
        }))
      };

      const res = await api.put(`/menu-items/${id}`, payload);
      if (res.data?.success) {
          setItem(res.data.data); // Update main view data
          setIsEditing(false); // Exit Edit Mode
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update item. Check console.");
    } finally {
      setSaveLoading(false);
    }
  };

  // --- FORM HANDLERS (Variations/Addons) ---
  const handleArrayChange = (type: 'variations' | 'addons', index: number, field: string, value: string) => {
    const newArray = [...formData[type]];
    newArray[index][field] = value;
    setFormData({ ...formData, [type]: newArray });
  };

  const addArrayItem = (type: 'variations' | 'addons') => {
    setFormData({
      ...formData,
      [type]: [...formData[type], { name: "", price: "" }]
    });
  };

  const removeArrayItem = (type: 'variations' | 'addons', index: number) => {
    const newArray = [...formData[type]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [type]: newArray });
  };


  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 animate-pulse text-lg">Loading details...</div>
      </div>
    );
  }

  if (!item) return <div className="text-center p-10">Item not found</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-blend backdrop-blur-1xl dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/items"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {isEditing ? "Edit Item" : "Item Details"}
            </h1>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => { setIsEditing(false); setFormData(item); }} // Cancel resets data
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                >
                  <X size={16} /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : <><Save size={16} /> Save Changes</>}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Image Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-2">
              <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                    <span className="text-sm mt-2">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Image Input (Only in Edit Mode) */}
              {isEditing && (
                <div className="mt-2 p-2">
                   <label className="text-xs font-semibold text-gray-500 uppercase">Image URL</label>
                   <input 
                      type="text" 
                      value={formData.image} 
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full text-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-1"
                   />
                </div>
              )}
            </div>

            {/* Status & Category */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              
              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <div>
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                   <div className={`mt-1 flex items-center gap-2 font-medium ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.isAvailable ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      {formData.isAvailable ? "Available" : "Unavailable"}
                   </div>
                </div>
                
                {/* Toggle Switch */}
                <div 
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                   onClick={handleToggleStatus} // Works in both edit and view mode for quick toggle
                >
                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

              {/* Category Selector */}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
                <div className="mt-1 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                   <Utensils size={18} className="text-blue-500" />
                   {isEditing ? (
                     <select 
                       value={formData.categoryId || ""}
                       onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                       className="w-full p-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                     >
                        {categories.map((cat) => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                     </select>
                   ) : (
                     <span>{item.category?.name || "Uncategorized"}</span>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                       <div>
                          <label className="text-xs text-gray-500">Item Name</label>
                          <input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full text-xl font-bold p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                       </div>
                       <div>
                          <label className="text-xs text-gray-500">Description</label>
                          <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                       </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                    </>
                  )}
                </div>

                <div className="text-right min-w-[120px]">
                  <span className="text-xs text-gray-500 uppercase">Base Price</span>
                  {isEditing ? (
                     <input 
                       type="number"
                       value={formData.price}
                       onChange={(e) => setFormData({...formData, price: e.target.value})}
                       className="w-full text-right font-bold p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs. {item.price}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Variations Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                     <Layers size={20} className="text-orange-500" /> Variations
                   </h3>
                   {isEditing && (
                      <button onClick={() => addArrayItem('variations')} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100">
                        + Add
                      </button>
                   )}
                </div>
                
                <div className="space-y-3">
                  {formData.variations?.map((v: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700 gap-2">
                       {isEditing ? (
                         <>
                           <input 
                             placeholder="Name" 
                             value={v.name} 
                             onChange={(e) => handleArrayChange('variations', idx, 'name', e.target.value)}
                             className="w-full p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                           />
                           <input 
                             placeholder="Price" 
                             type="number"
                             value={v.price} 
                             onChange={(e) => handleArrayChange('variations', idx, 'price', e.target.value)}
                             className="w-24 p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                           />
                           <button onClick={() => removeArrayItem('variations', idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                         </>
                       ) : (
                         <>
                           <span className="font-medium text-gray-700 dark:text-gray-200">{v.name}</span>
                           <span className="font-bold text-gray-900 dark:text-white">Rs. {v.price}</span>
                         </>
                       )}
                    </div>
                  ))}
                  {!isEditing && formData.variations?.length === 0 && (
                     <div className="text-center text-gray-400 text-sm italic py-4">No variations</div>
                  )}
                </div>
              </div>

              {/* Addons Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                     <PlusCircle size={20} className="text-purple-500" /> Addons
                   </h3>
                   {isEditing && (
                      <button onClick={() => addArrayItem('addons')} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100">
                        + Add
                      </button>
                   )}
                </div>

                <div className="space-y-3">
                  {formData.addons?.map((addon: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700 gap-2">
                       {isEditing ? (
                         <>
                           <input 
                             placeholder="Name" 
                             value={addon.name} 
                             onChange={(e) => handleArrayChange('addons', idx, 'name', e.target.value)}
                             className="w-full p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                           />
                           <input 
                             placeholder="Price" 
                             type="number"
                             value={addon.price} 
                             onChange={(e) => handleArrayChange('addons', idx, 'price', e.target.value)}
                             className="w-24 p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                           />
                           <button onClick={() => removeArrayItem('addons', idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                         </>
                       ) : (
                         <>
                           <span className="font-medium text-gray-700 dark:text-gray-200">{addon.name}</span>
                           <span className="font-bold text-gray-900 dark:text-white">+ Rs. {addon.price}</span>
                         </>
                       )}
                    </div>
                  ))}
                  {!isEditing && formData.addons?.length === 0 && (
                     <div className="text-center text-gray-400 text-sm italic py-4">No addons</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Item?</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <b>"{item.name}"</b>? This action cannot be undone.
             </p>
             <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ItemDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-gray-900 text-gray-500">Loading Page...</div>}>
      <ItemDetails />
    </Suspense>
  );
}