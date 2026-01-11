import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

// Text/Number Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    unit?: string;
    error?: string;
}

export function FormInput({ label, unit, error, className = '', ...props }: InputProps) {
    return (
        <div className={className}>
            <label className="label">{label}</label>
            <div className="relative">
                <input
                    className={`input-field ${unit ? 'pr-12' : ''} ${error ? 'border-red-500' : ''}`}
                    {...props}
                />
                {unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {unit}
                    </span>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

// Select Input
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function FormSelect({ label, options, error, className = '', ...props }: SelectProps) {
    return (
        <div className={className}>
            <label className="label">{label}</label>
            <select
                className={`select-field ${error ? 'border-red-500' : ''}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

// Checkbox Input
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FormCheckbox({ label, className = '', ...props }: CheckboxProps) {
    return (
        <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <input
                type="checkbox"
                className="w-4 h-4 text-re-blue border-gray-300 rounded focus:ring-re-blue"
                {...props}
            />
            <span className="text-gray-700">{label}</span>
        </label>
    );
}

// Radio Group
interface RadioOption {
    value: string;
    label: string;
    description?: string;
}

interface RadioGroupProps {
    label: string;
    name: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function FormRadioGroup({ label, name, options, value, onChange, className = '' }: RadioGroupProps) {
    return (
        <div className={className}>
            <label className="label">{label}</label>
            <div className="space-y-2">
                {options.map((opt) => (
                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-re-blue/50 transition-colors">
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="mt-0.5 w-4 h-4 text-re-blue border-gray-300 focus:ring-re-blue"
                        />
                        <div>
                            <span className="font-medium text-gray-900">{opt.label}</span>
                            {opt.description && (
                                <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
