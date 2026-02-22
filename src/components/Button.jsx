import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', style = {} }) => {
    const baseStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        border: 'none',
        boxSizing: 'border-box'
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--accent-gold)',
            color: '#000',
        },
        blue: {
            backgroundColor: 'var(--accent-blue)',
            color: '#fff',
        },
        secondary: {
            backgroundColor: 'transparent',
            color: 'var(--accent-gold)',
            border: '1px solid var(--accent-gold)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            style={{ ...baseStyle, ...variants[variant], ...style }}
        >
            {children}
        </button>
    );
};

export default Button;
