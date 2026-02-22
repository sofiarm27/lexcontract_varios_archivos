import React from 'react';

const Card = ({ children, style = {} }) => {
    return (
        <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            ...style
        }}>
            {children}
        </div>
    );
};

export default Card;
