import React from 'react';
import './Button.css';

/**
 * Button variants:
 *   "primary" — full-width tall button (login, save, etc.)
 *   "icon"    — 50×50 square icon button (logout, add, etc.)
 */
const Button = ({ variant = 'primary', onClick, children, style, disabled, title}) => {
    let className = '';

    switch (variant) {
        case 'icon':
            className = 'btn btn-icon';
            break;
        case 'full':
            className = 'btn btn-full';
            break;
        case 'full-unfocused':
            className = 'btn btn-full-unfocused';
            break;
        case 'primary':
            className = 'btn btn-primary';
            break;
    }

    return (
        <button
            className={className}
            onClick={onClick}
            style={style}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    );
};

export default Button;
