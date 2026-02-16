import React from "react";
import { Modal } from "@/components/ui/modal";

export interface DetailField {
    label: string;
    value?: string | number | null;
    render?: (data: any) => React.ReactNode;
    key?: string; // key to access in data if value is not provided
    fullWidth?: boolean; // if true, takes up full width in the grid
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
            className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        >
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-700">
                    {title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {field.label}
                                </div>
                                <div className="text-base text-gray-800 dark:text-gray-200 mt-1 break-words">
                                    {content}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
