"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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

    // Environment variables with fallbacks
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "durh1yv4o";
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "saif_pos_preset";

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max 5MB.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                onChange(data.secure_url);
                toast.success("Image uploaded successfully!");
            } else {
                console.error("Cloudinary error:", data);
                toast.error(data.error?.message || "Upload failed.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="relative w-full">
                {value ? (
                    <div className={`relative group ${isBanner ? 'aspect-[21/9] w-full' : 'h-44 w-full'
                        } rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md`}>
                        <img
                            src={value}
                            alt="Uploaded"
                            className={`w-full h-full ${isLogo
                                    ? 'object-contain bg-gray-50 dark:bg-gray-800 p-4'
                                    : 'object-cover transition-transform group-hover:scale-105 duration-500'
                                }`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
                                title="Change Image"
                            >
                                <Upload size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                title="Remove Image"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`${isBanner
                            ? 'aspect-[21/9] w-full'
                            : isLogo
                                ? 'w-full h-40'
                                : 'h-40 w-full'
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
                                        Click to upload {isBanner ? 'banner' : 'image'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        PNG, JPG, WEBP up to 5MB
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Decorative background element */}
                        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    );
};

export default ImageUpload;
