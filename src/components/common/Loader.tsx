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
            <div className={`${sizeClasses[size].split(' border')[0]} animate-spin text-brand-500`}>
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
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
