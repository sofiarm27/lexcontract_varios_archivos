import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Phone, Mail, ChevronDown, Save, MapPin, Building, Shield, User, Contact, Folder, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const EditClient = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        celular: '',
        correo: '',
        direccion: '',
        ciudad: '',
        estado: 'Activo'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/clients/${id}`);
                setFormData(data);
            } catch (err) {
                console.error('Error fetching client:', err);
                setMessage({ type: 'error', text: 'No se pudo cargar la información del cliente.' });
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            setSaving(true);
            setMessage(null);
            await api.put(`/clients/${id}`, formData);
            setMessage({ type: 'success', text: 'Cambios actualizados exitosamente' });
            setTimeout(() => navigate('/clients'), 1500);
        } catch (err) {
            console.error('Error updating client:', err);
            setMessage({ type: 'error', text: 'Error al actualizar el cliente.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando información del cliente...</div>;
    }

    return (
        <div style={{ color: 'white' }}>
            {/* Breadcrumb Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#92a4c9'
            }}>
                <span
                    onClick={() => navigate('/clients')}
                    style={{ cursor: 'pointer', color: '#92a4c9' }}
                >
                    Clientes
                </span>
                <span>/</span>
                <span
                    onClick={() => navigate(`/clients/edit/${id}`)}
                    style={{ cursor: 'pointer', color: '#92a4c9' }}
                >
                    Editar Cliente
                </span>
                <span>/</span>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>{formData.nombre} {formData.apellido}</span>
            </div>

            {/* Page Header */}
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
                    Editar Cliente
                </h1>
                <p style={{ color: '#92a4c9', fontSize: '0.9375rem' }}>
                    Actualice la información del perfil y detalles contractuales del cliente.
                </p>
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
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    maxWidth: '900px'
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
                </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
                <Card style={{
                    padding: '2rem',
                    maxWidth: '900px',
                    background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                    border: '1px solid #324467',
                    borderRadius: '1rem'
                }}>
                    {/* IDENTIFICACIÓN DEL SISTEMA Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.25rem',
                            color: '#D4AF37',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Shield size={16} />
                            IDENTIFICACIÓN DEL SISTEMA
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Read Only ID */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    ID de Sistema (Solo lectura)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={`LC-2025-${String(id).padStart(4, '0')}`}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid #324467',
                                        borderRadius: '0.5rem',
                                        color: '#6b7a92',
                                        cursor: 'not-allowed',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            {/* ID Number */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Cédula / Pasaporte
                                </label>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    disabled
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(30, 45, 69, 0.2)',
                                        border: '1px solid #324467',
                                        borderRadius: '0.5rem',
                                        color: '#6b7a92',
                                        cursor: 'not-allowed',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* INFORMACIÓN PERSONAL Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.25rem',
                            color: '#D4AF37',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <User size={16} />
                            INFORMACIÓN PERSONAL
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#0f1621',
                                        border: '1px solid #324467',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            {/* Last Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#0f1621',
                                        border: '1px solid #324467',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* INFORMACIÓN DE CONTACTO Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.25rem',
                            color: '#D4AF37',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Contact size={16} />
                            INFORMACIÓN DE CONTACTO
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Phone */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Celular
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#D4AF37'
                                    }} />
                                    <input
                                        type="text"
                                        name="celular"
                                        value={formData.celular}
                                        onChange={handleChange}
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        title="El celular debe tener exactamente 10 dígitos numéricos"
                                        placeholder="3001234567"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                                            backgroundColor: '#0f1621',
                                            border: '1px solid #324467',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Correo Electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#D4AF37'
                                    }} />
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                                            backgroundColor: '#0f1621',
                                            border: '1px solid #324467',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Dirección
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#D4AF37'
                                    }} />
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                                            backgroundColor: '#0f1621',
                                            border: '1px solid #324467',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* City */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                    Ciudad
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Building size={16} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#D4AF37'
                                    }} />
                                    <input
                                        type="text"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                                            backgroundColor: '#0f1621',
                                            border: '1px solid #324467',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DETALLES DEL SERVICIO Section */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.25rem',
                            color: '#D4AF37',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Folder size={16} />
                            DETALLES DEL SERVICIO
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                Servicio Contratado
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    name="servicio"
                                    value={formData.servicio || 'insolvencia'}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#0f1621',
                                        border: '1px solid #324467',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <option value="insolvencia">Insolvencia Económica</option>
                                </select>
                                <ChevronDown size={20} style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7a92',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    marginTop: '2rem',
                    maxWidth: '900px'
                }}>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/clients')}
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            borderColor: '#D4AF37',
                            color: '#D4AF37'
                        }}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            backgroundColor: '#D4AF37',
                            color: '#0A2A4E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: 'none'
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'ACTUALIZANDO...' : 'ACTUALIZAR CAMBIOS'}
                    </Button>
                </div>
            </form>

            {/* Footer */}
            <div style={{
                marginTop: '3rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#6b7a92',
                maxWidth: '900px'
            }}>
                LexContract v2.4.0 — Módulo de Clientes
            </div>
        </div>
    );
};

export default EditClient;
