import React from 'react';
import { TextSearch } from 'lucide-react';
import './Inputs.css';

/**
 * Input variants:
 *   "default"  — plain text/password input (white bg)
 *   "search"   — with filter icon, white bg
 *   "search-muted" — with filter icon, gray bg
 */
const Input = ({
    variant = 'default',
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    style,
    ...props
}) => {
    const isSearch = variant === 'search' || variant === 'search-muted';

    const inputClass = [
        'custom-input',
        isSearch ? 'input-search' : '',
        variant === 'search-muted' ? 'input-search-muted' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className="input-wrapper" style={style}>
            {isSearch && (
                <span className="input-icon">
                    <TextSearch size={24} />
                </span>
            )}
            <input
                {...props}
                name={name}
                className={inputClass}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;