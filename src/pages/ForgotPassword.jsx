import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import logo from '../assets/logo.png';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(false);
        setMessage(null);
        setError(null);

        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        try {
            setLoading(true);
            await api.post('/forgot-password', { correo: email });
            setMessage('Se han enviado las instrucciones a tu correo electrónico.');
            setEmail('');
        } catch (err) {
            console.error('Error in forgot password:', err);
            setError(err.message || 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
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
                {/* Brand Logo - Circular Emblem with Text */}
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>¿Problemas al acceder?</h2>
                    <p style={{ color: '#92a4c9', fontSize: '0.925rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '2rem' }}>
                        Te enviaremos instrucciones para restablecer tu contraseña.
                    </p>

                    {message && (
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', width: '100%', fontSize: '0.9rem' }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', width: '100%', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Escribe tu correo"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1.125rem',
                                    backgroundColor: '#101622',
                                    border: '1px solid #324467',
                                    borderRadius: '0.75rem',
                                    color: '#FFFFFF',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#D4AF37';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#324467';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                backgroundColor: '#D4AF37',
                                color: '#0A2A4E',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Enviando...' : 'Enviar instrucciones'}
                        </Button>
                    </form>
                </Card>

                <div style={{ marginTop: '2.5rem' }}>
                    <span
                        onClick={() => navigate('/login')}
                        style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', borderBottom: '1.5px solid #FFFFFF', paddingBottom: '2px' }}
                    >
                        Volver al inicio de sesión
                    </span>
                </div>
            </div>

            <footer style={{ marginTop: 'auto', padding: '2rem 0', color: '#92a4c9', fontSize: '0.8rem' }}>
                <p>© 2026 LexContract. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default ForgotPassword;
