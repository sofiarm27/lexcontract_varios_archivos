import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import logo from '../assets/logo.png';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasLength = password.length >= 8;

        if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(true);
            await api.post('/reset-password', {
                token: token,
                new_password: password
            });
            setSuccess(true);
            setMessage('Tu contraseña ha sido restaurada con éxito.');
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('El enlace es inválido o ha expirado. Por favor solicita uno nuevo.');
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
                {/* Brand Logo */}
                <div
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                >
                    <img
                        src={logo}
                        alt="LexContract Logo"
                        style={{ width: '70px', height: '70px', objectFit: 'contain' }}
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                        Nueva Contraseña
                    </h2>

                    {!success && (
                        <p style={{ color: '#92a4c9', fontSize: '0.925rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '2rem' }}>
                            Por favor ingresa tu nueva contraseña a continuación.
                        </p>
                    )}

                    {message && (
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', width: '100%', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <CheckCircle2 size={18} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', width: '100%', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <XCircle size={18} />
                            {error}
                        </div>
                    )}

                    {!success ? (
                        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>Contraseña Nueva</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="8+ car, Mayús, Minús, Núm"
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
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.5rem',
                                    marginTop: '0.75rem'
                                }}>
                                    {[
                                        { label: '8+ caracteres', met: password.length >= 8 },
                                        { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
                                        { label: 'Una minúscula', met: /[a-z]/.test(password) },
                                        { label: 'Un número', met: /[0-9]/.test(password) }
                                    ].map((req, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: req.met ? '#22c55e' : '#475569'
                                        }}>
                                            {req.met ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite tu contraseña"
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
                                        boxSizing: 'border-box'
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
                                {loading ? 'Restaurando...' : 'Restablecer Contraseña'}
                            </Button>
                        </form>
                    ) : (
                        <Button
                            onClick={() => navigate('/login')}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                backgroundColor: '#D4AF37',
                                color: '#0A2A4E',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Ir al Inicio de Sesión
                        </Button>
                    )}
                </Card>

                {error && !success && (
                    <div style={{ marginTop: '2.5rem' }}>
                        <span
                            onClick={() => navigate('/forgot-password')}
                            style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', borderBottom: '1.5px solid #FFFFFF', paddingBottom: '2px' }}
                        >
                            Solicitar nuevo enlace
                        </span>
                    </div>
                )}
            </div>

            <footer style={{ marginTop: 'auto', padding: '2rem 0', color: '#92a4c9', fontSize: '0.8rem' }}>
                <p>© 2026 LexContract. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default ResetPassword;
