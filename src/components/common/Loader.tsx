import React from "react";

interface LoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    text?: string;
}

const sizeMap: Record<string, { size: number; border: number }> = {
    sm:  { size: 24,  border: 3 },
    md:  { size: 44,  border: 4 },
    lg:  { size: 64,  border: 5 },
    xl:  { size: 96,  border: 7 },
};

const Loader: React.FC<LoaderProps> = ({
    className = "",
    size = "xl",
    showText = false,
    text = "Loading...",
}) => {
    const { size: px, border } = sizeMap[size];
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                style={{
                    width: px,
                    height: px,
                    borderWidth: border,
                    borderStyle: "solid",
                    borderColor: "transparent",
                    borderBottomColor: "#3b82f6",
                    borderRadius: "9999px",
                    animation: "spin 0.75s linear infinite",
                }}
            />
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
