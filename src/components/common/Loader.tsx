import React from "react";

interface LoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    text?: string;
}

const sizeMap: Record<string, { size: number; thickness: number }> = {
    sm: { size: 24, thickness: 2.5 },
    md: { size: 44, thickness: 3 },
    lg: { size: 64, thickness: 3.5 },
    xl: { size: 96, thickness: 4 },
};

const Loader: React.FC<LoaderProps> = ({
    className = "",
    size = "xl",
    showText = false,
    text = "Loading...",
}) => {
    const { size: px, thickness } = sizeMap[size];

    return (
        <div className={`flex flex-col items-center justify-center ${showText ? "space-y-3" : ""} ${className}`}>
            {/* Keyframes embedded — no globals.css needed */}
            <style>{`
                @keyframes saif-comet-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* 
                The "comet" arc effect:
                - conic-gradient: draws roughly a 180° arc that fades in from transparent, 
                  becomes solid in the middle, then fades back to transparent
                - radial mask: punches a hole in the middle, leaving only the ring/arc
                - filter: blur gives the "blurry soft sides, thick center" look
                - animation: pure rotation spin
            */}
            <div
                style={{
                    width: px,
                    height: px,
                    borderRadius: '50%',
                    background: `conic-gradient(
                        from 0deg,
                        transparent        0deg,
                        transparent        60deg,
                        rgba(93,105,185,0.15) 90deg,
                        rgba(93,105,185,0.6)  130deg,
                        #5d69b9            180deg,
                        rgba(93,105,185,0.6)  220deg,
                        rgba(93,105,185,0.15) 260deg,
                        transparent        290deg,
                        transparent        360deg
                    )`,
                    WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), black 0)`,
                    mask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), black 0)`,
                    filter: `blur(${thickness * 0.35}px)`,
                    animation: 'saif-comet-spin 1.2s linear infinite',
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
        <Loader size="lg" showText={!!text} text={text} />
    </div>
);

export default Loader;

