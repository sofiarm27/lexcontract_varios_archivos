import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, X, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        correo: '',
        celular: '',
        biografia: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await api.get('/users/me');
                setFormData({
                    nombre: user.nombre,
                    apellido: user.apellido,
                    cedula: user.cedula,
                    correo: user.correo,
                    celular: user.celular || '',
                    biografia: user.biografia || ''
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
                setMessage({ type: 'error', text: 'No se pudo cargar el perfil.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage(null);

            const updatePayload = { ...formData };

            await api.request('/users/me', {
                method: 'PUT',
                body: JSON.stringify(updatePayload)
            });

            setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' });
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando perfil...</div>;
    }

    return (
        <div style={{ color: 'white', maxWidth: '700px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Editar Mi Perfil</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Actualice sus datos personales y profesionales.</p>
            </header>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
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

            <Card style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '2rem', fontWeight: 800 }}>
                            {formData.nombre[0]}{formData.apellido[0]}
                        </div>
                        <button style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--accent-gold)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer' }}>
                            <Camera size={16} />
                        </button>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Avatar generado automáticamente</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Apellido</label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cédula (No editable)</label>
                        <div style={{ position: 'relative' }}>
                            <AlertCircle size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={formData.cedula}
                                disabled
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-muted)', outline: 'none', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Celular</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                            <input
                                type="text"
                                name="celular"
                                value={formData.celular}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                maxLength={10}
                                title="El celular debe tener exactamente 10 dígitos numéricos"
                                placeholder="Ej: 3001234567"
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Biografía / Perfil Profesional</label>
                        <textarea
                            name="biografia"
                            rows="4"
                            placeholder="Cuéntenos sobre su experiencia profesional..."
                            value={formData.biografia}
                            onChange={handleChange}
                            style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none', resize: 'vertical' }}
                        ></textarea>
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="outline" type="button" onClick={() => navigate('/profile')}>
                            <X size={18} />
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            <Save size={18} />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EditProfile;
