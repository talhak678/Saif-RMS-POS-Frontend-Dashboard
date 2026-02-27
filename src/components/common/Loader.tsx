import React from "react";

interface LoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    text?: string;
}

const sizeMap: Record<string, { size: number; border: number }> = {
    sm: { size: 24, border: 3 },
    md: { size: 44, border: 4 },
    lg: { size: 64, border: 5 },
    xl: { size: 96, border: 7 },
};

const Loader: React.FC<LoaderProps> = ({
    className = "",
    size = "xl",
    showText = false,
    text = "Loading...",
}) => {
    const { size: px } = sizeMap[size];
    return (
        <div className={`flex flex-col items-center justify-center ${showText ? "space-y-3" : ""} ${className}`}>
            <div
                style={{ width: px, height: px }}
                className="animate-spin text-brand-500"
            >
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            {showText && (
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    {text}
                </p>
            )}
        </div>
    );
};

export const FullPageLoader = ({ text }: { text?: string }) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <Loader size="lg" showText={!!text} text={text} />
    </div>
);

export default Loader;
