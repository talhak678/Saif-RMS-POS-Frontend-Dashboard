"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    isBanner?: boolean;
    isLogo?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "", isBanner = false, isLogo = false }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "durh1yv4o";
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "saif_pos_preset";

    const validateLogoImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            // GIFs cannot be read as Image easily — skip dimension check
            if (file.type === "image/gif") { resolve(true); return; }
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                if (img.width < 100 || img.height < 100) {
                    toast.error(`Logo too small (${img.width}×${img.height}px). Minimum: 100×100px.`);
                    resolve(false);
                } else if (Math.abs(img.width - img.height) / Math.max(img.width, img.height) > 0.5) {
                    toast.error(`Logo should be roughly square. Current ratio: ${img.width}×${img.height}px is too wide/tall.`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(true); };
            img.src = url;
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = isLogo ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        const maxSizeLabel = isLogo ? "2MB" : "5MB";

        if (file.size > maxSize) {
            toast.error(`File too large. Max ${maxSizeLabel} for ${isLogo ? "logos" : "images"}.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (isLogo) {
            const valid = await validateLogoImage(file);
            if (!valid) {
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await response.json();
            if (data.secure_url) {
                onChange(data.secure_url);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error(data.error?.message || "Upload failed.");
            }
        } catch {
            toast.error("An error occurred during upload.");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = () => {
        onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            )}
            <div className="relative w-full">
                {value ? (
                    <div className={`relative group ${isBanner ? "aspect-[21/9] w-full"
                            : isLogo ? "w-full aspect-square max-h-52"
                                : "h-44 w-full"
                        } rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-gray-50 dark:bg-gray-800`}>
                        <img
                            src={value}
                            alt="Uploaded"
                            className={`w-full h-full ${isLogo ? "object-contain p-4" : "object-cover transition-transform group-hover:scale-105 duration-500"}`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30" title="Change">
                                <Upload size={20} />
                            </button>
                            <button type="button" onClick={removeImage}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg" title="Remove">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`${isBanner ? "aspect-[21/9] w-full"
                                : isLogo ? "w-full aspect-square max-h-52"
                                    : "h-40 w-full"
                            } rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group overflow-hidden relative`}
                    >
                        {loading ? (
                            <Loader size="md" />
                        ) : (
                            <>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                    <ImageIcon size={32} />
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                                        Click to upload {isLogo ? "logo" : isBanner ? "banner" : "image"}
                                    </p>
                                    {isLogo ? (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                <CheckCircle2 size={11} className="text-emerald-500" />
                                                Square (1:1) recommended — min 100×100px
                                            </p>
                                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                                <AlertCircle size={11} className="text-amber-400" />
                                                PNG, JPG, GIF, WEBP — max 2MB
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </div>
        </div>
    );
};

export default ImageUpload;
