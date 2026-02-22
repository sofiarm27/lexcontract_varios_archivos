import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import logo from '../assets/logo.png';

const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSupportPage = location.pathname === '/support';

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            backgroundColor: 'rgba(16, 22, 34, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4rem',
            zIndex: 1000,
        }}>
            <div
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
                {/* Circular Emblem Logo */}
                <img
                    src={logo}
                    alt="LexContract Logo"
                    style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'contain'
                    }}
                />
                {/* Text Branding */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'white', lineHeight: 1 }}>
                        lexContract
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1.5px', color: 'var(--accent-gold)', textTransform: 'uppercase', lineHeight: 1 }}>
                        {isSupportPage ? 'SOPORTE PÚBLICO' : 'SEGURIDAD BLINDADA & JUSTICIA'}
                    </span>
                </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                {location.pathname !== '/' && (
                    <NavLink to="/" style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    }}>Volver al Inicio</NavLink>
                )}

                <NavLink to="/about" style={{
                    color: location.pathname === '/about' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                }}>Sobre Nosotros</NavLink>

                <NavLink to="/support" style={{
                    color: location.pathname === '/support' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                }}>Soporte TI</NavLink>

                <Button
                    onClick={() => navigate('/login')}
                    variant="primary"
                    style={{
                        padding: '0.6rem 1.5rem',
                        fontSize: '0.875rem',
                        height: 'auto',
                        backgroundColor: 'var(--accent-gold)',
                        color: 'black',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>→</span> Iniciar Sesión
                </Button>
            </nav>
        </header>
    );
};

export default PublicHeader;
