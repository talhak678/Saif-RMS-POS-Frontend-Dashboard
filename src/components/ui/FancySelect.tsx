"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface Option {
    value: string;
    label: string;
}

interface FancySelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function FancySelect({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    disabled = false,
}: FancySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside both the button container AND the portal menu
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            updateCoords();
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    const menu = (
        <div
            ref={menuRef}
            className="fixed z-[10000000] mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1"
            style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                minWidth: "160px",
            }}
        >
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/30 ${value === opt.value
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 font-bold"
                            : "text-gray-700 dark:text-gray-300"
                            }`}
                        onClick={() => {
                            onChange(opt.value);
                            setIsOpen(false);
                        }}
                    >
                        {opt.label}
                        {value === opt.value && <Check size={14} />}
                    </button>
                ))}
                {options.length === 0 && (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center italic">No options available</div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${isOpen ? "ring-2 ring-brand-500 border-brand-500" : ""
                    }`}
            >
                <span className={selectedOption ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && mounted && createPortal(menu, document.body)}
        </div>
    );
}
