"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { X, Info } from "lucide-react";

export interface DetailField {
    label: string;
    value?: string | number | null;
    render?: (data: any) => React.ReactNode;
    key?: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

interface ViewDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    fields: DetailField[];
}

export const ViewDetailModal: React.FC<ViewDetailModalProps> = ({
    isOpen,
    onClose,
    title,
    data,
    fields,
}) => {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-4xl bg-white dark:bg-gray-900 
                 rounded-2xl shadow-2xl border border-gray-200 
                 dark:border-gray-700 flex flex-col 
                 max-h-fit"
        >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center">
                        <Info size={18} className="text-brand-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field, index) => {
                        const content = field.render
                            ? field.render(data)
                            : field.key
                                ? data[field.key]
                                : field.value;

                        if (content === undefined || content === null) return null;

                        return (
                            <div
                                key={index}
                                className={`${field.fullWidth ? "md:col-span-2" : ""}`}
                            >
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        {field.icon && (
                                            <span className="text-brand-600">{field.icon}</span>
                                        )}
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {field.label}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                                        {content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 
                     text-white rounded-xl text-xs font-semibold 
                     uppercase tracking-wide transition active:scale-95"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};