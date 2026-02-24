"use client";
import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Calendar } from "lucide-react";

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    showTime?: boolean;
    className?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select Date", showTime = false, className = "" }: DatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpRef = useRef<any>(null);

    useEffect(() => {
        if (inputRef.current) {
            fpRef.current = flatpickr(inputRef.current, {
                enableTime: showTime,
                dateFormat: showTime ? "Y-m-d H:i" : "Y-m-d",
                defaultDate: value,
                onChange: (selectedDates, dateStr) => {
                    onChange(dateStr);
                },
                static: true, // helps with positioning in modals
            });
        }

        return () => {
            if (fpRef.current) {
                fpRef.current.destroy();
            }
        };
    }, [showTime]);

    // Update flatpickr if value changes externally
    useEffect(() => {
        if (fpRef.current && value !== fpRef.current.input.value) {
            fpRef.current.setDate(value, false);
        }
    }, [value]);

    return (
        <div className="relative flex items-center group">
            <input
                ref={inputRef}
                placeholder={placeholder}
                className={`w-full bg-transparent outline-none cursor-pointer ${className}`}
                readOnly
            />
            <Calendar size={14} className="absolute right-0 text-gray-400 group-hover:text-brand-500 pointer-events-none transition-colors" />
        </div>
    );
}
