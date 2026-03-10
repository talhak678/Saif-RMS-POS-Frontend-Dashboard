import Loader from '@/components/common/Loader';
import { File, Eye, EyeOff } from 'lucide-react';
import React, { useEffect } from 'react';
import { useState } from 'react';

interface inputProps {
    onKeyPress?: (e: any) => void,
    onPaste?: (e: any) => void,
    inputMode?: any
    ref?: any,
    step?: number;
    min?: number;
    max?: number;
    onFocus?: any;
    onBlur?: any;
    placeholder?: string;
    value?: any,
    name?: string,
    className?: string,
    type?: string,
    width?: string,
    required?: boolean,
    onChange?: (e: any) => void,
    label?: string,
    errorMessage?: string,
    disabled?: boolean;
    id?: string;
    accept?: string,
    checked?: boolean;
    readOnly?: boolean;
    defaultValue?: string;
    error?: boolean;
    success?: boolean;
    hint?: string;
}

const Input: React.FC<inputProps> = ({
    ref,
    step,
    min,
    max,
    accept,
    onFocus,
    onBlur,
    placeholder,
    name,
    value,
    className = "",
    type = "text",
    width = "full",
    required = false,
    onChange,
    onKeyPress,
    onPaste,
    inputMode,
    label = "",
    errorMessage = "This field is required",
    disabled,
    checked,
    id,
    defaultValue,
    error,
    success,
    hint,
    ...props
}) => {
    const [touched, setTouched] = useState(false)
    const [isInvalid, setIsInvalid] = useState(false)
    const [customError, setCustomError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const isEmpty = value?.toString().trim() === "";
        let isValidPhone = true;

        if (type === "phone" && !isEmpty) {
            const phoneRegex = /^[0-9]{10,15}$/;
            isValidPhone = phoneRegex.test(value.toString());
            setCustomError(isValidPhone ? "" : "Invalid Phone Number");
        }

        if (required && touched && isEmpty) {
            setIsInvalid(true);
            setCustomError(errorMessage);
        } else if (type === "phone" && touched && !isEmpty && !isValidPhone) {
            setIsInvalid(true);
        } else {
            setIsInvalid(false);
            setCustomError("");
        }
    }, [value, touched, required, type, errorMessage]);

    const baseClasses = `
        w-${width} border ${isInvalid || error ? "border-red-500" : success ? "border-green-500" : "border-gray-300 dark:border-gray-600"} 
        bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:dark:bg-gray-800 
        disabled:text-muted dark:bg-gray-900 rounded-lg px-3 py-2 
        text-gray-900 dark:text-white transition-colors duration-200`

    const focusClasses =
        type !== "radio"
            ? "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            : "focus:outline-none"

    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="mb-2">
            {label && <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
            <div className="relative">
                <input
                    onFocus={() => {
                        if (onFocus) {
                            onFocus()
                        }
                    }}
                    accept={accept}
                    step={step}
                    min={min}
                    max={max}
                    inputMode={inputMode}
                    onKeyPress={onKeyPress}
                    onPaste={onPaste}
                    checked={checked}
                    id={id}
                    disabled={disabled}
                    placeholder={placeholder}
                    name={name}
                    className={`${baseClasses} ${focusClasses} ${className} ${isPassword ? "pr-10" : ""}`}
                    type={currentType}
                    value={value !== undefined ? value : defaultValue}
                    onChange={onChange}
                    onBlur={() => {
                        setTouched(true)
                        if (onBlur) {
                            onBlur()
                        }
                    }}
                    ref={ref}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {isInvalid && <p className="text-sm text-red-500 mt-1 transition-opacity duration-200">{customError}</p>}
            {!isInvalid && hint && <p className={`text-sm mt-1 ${error ? "text-red-500" : success ? "text-green-500" : "text-gray-500"}`}>{hint}</p>}
        </div>
    )
}

export default Input;

export const FileInput = ({ className = '', type = 'file', loading = false, ...props }) => {
    return (
        <div className={`relative w-full h-40 ${className} border-4 border-gray-500 dark:border-gray-300 rounded-lg border-dotted flex items-center justify-center `}>
            <input
                className={`absolute opacity-0 inset-0 cursor-pointer`}
                type={type}
                {...props}
                accept="image/*"
            />
            <div className='justify-items-center text-gray-700 dark:text-gray-300'>
                {loading ? <Loader size="sm" showText={false} className="space-y-0" /> : <File className='text-7xl font-semibold' />}
                <p className='text-2xl font-medium '>Drag, drop or click to upload images</p>
            </div>
        </div>
    );
};
