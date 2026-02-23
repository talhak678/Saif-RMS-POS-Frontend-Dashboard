import React from "react";

interface LoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ className = "", size = "md", showText = true }) => {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        md: "w-10 h-10 border-4",
        lg: "w-16 h-16 border-4",
    };

    return (
        <div className={`flex flex-col items-center justify-center ${showText ? "space-y-3" : ""} ${className}`}>
            <div
                className={`${sizeClasses[size]} border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin`}
            />
            {showText && (
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                    Loading...
                </p>
            )}
        </div>
    );
};

export const FullPageLoader = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <Loader size="md" />
    </div>
);

export default Loader;
