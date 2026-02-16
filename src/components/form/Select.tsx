"use client";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  SelectClassName?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  Value?: string;
  errorMessage?: string,
  clearAble?: boolean;
  onClear?: (value: any) => void;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  required = false,
  disabled = false,
  errorMessage = "This field is required",
  Value,
  clearAble,
  onClear,
  SelectClassName
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(Value || defaultValue);
  const [touched, setTouched] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    setIsInvalid(required && touched && Value?.trim() === "")
  }, [Value, touched, required])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        disabled={disabled}
        className={`h-11 ${SelectClassName} w-full disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-1 focus:outline-black dark:focus:outline-white border px-4 py-2.5 pr-11 text-md shadow-theme-xs placeholder:text-gray-400 
          ${isInvalid ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
          } ${className}`}
        value={Value || selectedValue}
        onBlur={() => setTouched(true)}
        onChange={handleChange}
        required={required}
      >
        {/* Placeholder option */}
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {/* Map over options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      {clearAble && Value && Value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onClear!(0)
            setSelectedValue('')
          }}
          className="absolute inset-y-0 right-0 px-3 flex items-center rounded-r-lg transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      )}
      {isInvalid && <p className="text-sm text-red-500 mt-1 transition-opacity duration-200">{errorMessage}</p>}
    </div>
  );
};

export default Select;
