import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import logo from '../assets/logo.png';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(email, password);
            localStorage.setItem('token', data.access_token);
            // Redirigir al dashboard tras el login exitoso
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#101622',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            color: '#FFFFFF',
            fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                >
                    <img
                        src={logo}
                        alt="LexContract Logo"
                        style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'contain'
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: '#FFFFFF', lineHeight: 1 }}>lexContract</h1>
                        <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.8px', margin: 0, color: '#D4AF37', textTransform: 'uppercase', lineHeight: 1 }}>Seguridad Blindada & Justicia</p>
                    </div>
                </div>

                <Card style={{
                    width: '100%',
                    padding: '2.5rem 2rem',
                    backgroundColor: '#192233',
                    borderRadius: '1.25rem',
                    border: '1px solid #324467',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Bienvenido de nuevo</h2>
                        <p style={{ color: '#92a4c9', fontSize: '0.925rem', fontWeight: 500, lineHeight: 1.5 }}>Ingrese sus credenciales para acceder.</p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444',
                            fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={18} />
                            <span style={{ fontWeight: 600 }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: '#92a4c9' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1.125rem 0.875rem 3.25rem',
                                        backgroundColor: '#101622',
                                        border: '1px solid #324467',
                                        borderRadius: '0.75rem',
                                        color: '#FFFFFF',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: '#92a4c9' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3.25rem 0.875rem 3.25rem',
                                        backgroundColor: '#101622',
                                        border: '1px solid #324467',
                                        borderRadius: '0.75rem',
                                        color: '#FFFFFF',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1.125rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#92a4c9', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                ¿Olvidaste tu contraseña?
                            </span>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                backgroundColor: loading ? '#324467' : '#D4AF37',
                                color: '#0A2A4E',
                                borderRadius: '0.75rem',
                                marginTop: '0.5rem',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </Card>

                {/* Back Link */}
                <div style={{ marginTop: '2.5rem' }}>
                    <span
                        onClick={() => navigate('/')}
                        style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: 0.9, borderBottom: '1.5px solid #FFFFFF', paddingBottom: '2px' }}
                    >
                        Volver al inicio
                    </span>
                </div>
            </div>

            <footer style={{ marginTop: 'auto', padding: '2rem 0', color: '#92a4c9', fontSize: '0.8rem' }}>
                <p>© 2024 LexContract. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Login;
