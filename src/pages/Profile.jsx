import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Shield,
    Edit2,
    Camera,
    Calendar,
    MapPin,
    X,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Save,
    Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api'; // Assuming an API service is available

const Profile = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordUpdated, setPasswordUpdated] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [message, setMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await api.get('/users/me'); // Adjust endpoint as necessary
                setUserData(data); // Assuming data is in response.data
            } catch (err) {
                console.error('Error fetching profile:', err);
                // Optionally set an error state here
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const validatePassword = (pass) => {
        return {
            length: pass.length >= 8,
            hasUpper: /[A-Z]/.test(pass),
            hasLower: /[a-z]/.test(pass),
            hasNumber: /[0-9]/.test(pass)
        };
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Cargando perfil...</div>;
    if (!userData) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Error al cargar el perfil. Por favor, intente de nuevo.</div>;

    const security = validatePassword(passwordData.new);
    const isMatched = passwordData.new === passwordData.confirm && passwordData.confirm !== '';
    const isValid = security.length && security.hasUpper && security.hasLower && security.hasNumber && isMatched;

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleSave = async () => {
        if (isValid) {
            try {
                setIsSaving(true);
                setMessage(null);

                await api.post('/users/me/change-password', {
                    current_password: passwordData.current,
                    new_password: passwordData.new
                });

                setMessage({ type: 'success', text: '¡Contraseña actualizada exitosamente!' });
                setPasswordUpdated(true);

                // Close modal after delay
                setTimeout(() => {
                    setIsModalOpen(false);
                    setMessage(null);
                    setPasswordData({ current: '', new: '', confirm: '' });
                }, 2000);
            } catch (err) {
                console.error('Error changing password:', err);
                // The custom api service throws an Error with the message from the backend
                const errorMessage = err.message || 'Error al actualizar la contraseña.';
                setMessage({
                    type: 'error',
                    text: errorMessage
                });
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div style={{ color: 'white', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mi Perfil</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestione su información personal y preferencias de cuenta.</p>
                </div>
                <Button onClick={() => navigate('/profile/edit')}>
                    <Edit2 size={18} />
                    Editar Perfil
                </Button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Left Column - Avatar & Core Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem auto' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '2.5rem', fontWeight: 800 }}>
                                {getInitials(userData.nombre)}
                            </div>
                            <button style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--accent-gold)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{userData.nombre} {userData.apellido || ''}</h2>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.875rem' }}>{userData.rol?.nombre || 'Abogado'}</span>
                    </Card>

                    <Card style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Detalles de Acceso</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Calendar size={16} />
                                <span>Miembro desde: {userData.fecha_creacion ? new Date(userData.fecha_creacion).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Shield size={16} />
                                <span>Última conexión: {userData.ultima_conexion ? new Date(userData.ultima_conexion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ahora'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Detailed Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Información Personal</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Correo Electrónico</p>
                                <p style={{ fontSize: '1rem', fontWeight: 500 }}>{userData.correo}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Número de Celular</p>
                                <p style={{ fontSize: '1rem', fontWeight: 500 }}>{userData.celular}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Biografía / Perfil Profesional</p>
                                <p style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: '1.6' }}>{userData.biografia || 'Sin biografía disponible.'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Seguridad de la Cuenta</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contraseña</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {passwordUpdated
                                        ? 'Actualizada recientemente'
                                        : `Última actualización: ${userData.fecha_creacion ? new Date(userData.fecha_creacion).toLocaleDateString() : 'No disponible'}`
                                    }
                                </p>
                            </div>
                            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Cambiar Contraseña</Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Change Password Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <Card style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '0',
                        overflow: 'hidden',
                        border: '1px solid #1e2d45',
                        background: '#0d1a2d',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e2d45', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 45, 69, 0.3)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Cambiar Contraseña</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem 2rem 0' }}>
                            {message && (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                                    color: message.type === 'success' ? '#22c55e' : '#ef4444'
                                }}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Current Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>Contraseña actual *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="current"
                                        value={passwordData.current}
                                        onChange={handlePasswordChange}
                                        placeholder="Ingrese su contraseña actual"
                                        style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.8rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                    />
                                    <button onClick={() => toggleVisibility('current')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #1e2d45', margin: '0.5rem 0' }} />

                            {/* New Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>Nueva contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="new"
                                        value={passwordData.new}
                                        onChange={handlePasswordChange}
                                        placeholder="Mínimo 8 caracteres"
                                        style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.8rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                    />
                                    <button onClick={() => toggleVisibility('new')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: security.length ? '#22c55e' : '#475569' }}>
                                        {security.length ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} 8+ caracteres
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: security.hasUpper ? '#22c55e' : '#475569' }}>
                                        {security.hasUpper ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} Una mayúscula
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: security.hasLower ? '#22c55e' : '#475569' }}>
                                        {security.hasLower ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} Una minúscula
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: security.hasNumber ? '#22c55e' : '#475569' }}>
                                        {security.hasNumber ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} Un número
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>Confirmar nueva contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirm"
                                        value={passwordData.confirm}
                                        onChange={handlePasswordChange}
                                        placeholder="Repita su nueva contraseña"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 3rem 0.75rem 2.8rem',
                                            backgroundColor: '#0a1423',
                                            border: `1px solid ${isMatched ? '#22c55e' : passwordData.confirm ? '#ef4444' : '#1e2d45'}`,
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                    <button onClick={() => toggleVisibility('confirm')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordData.confirm && !isMatched && (
                                    <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>Las contraseñas no coinciden</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} style={{ borderColor: '#1e2d45', color: 'white' }}>Cancelar</Button>
                                <Button
                                    onClick={handleSave}
                                    style={{
                                        backgroundColor: isValid && !isSaving ? 'var(--accent-gold)' : '#1e2d45',
                                        color: isValid && !isSaving ? '#000' : '#475569',
                                        border: 'none',
                                        cursor: isValid && !isSaving ? 'pointer' : 'not-allowed'
                                    }}
                                    disabled={!isValid || isSaving}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Profile;
