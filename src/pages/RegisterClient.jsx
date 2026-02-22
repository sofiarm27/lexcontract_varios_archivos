import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    CreditCard,
    Phone,
    Mail,
    MapPin,
    Save,
    X,
    Briefcase,
    Lock,
    CheckCircle2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const RegisterClient = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '', // Added based on existing form field
        cedula: '',
        celular: '',
        correo: '',
        direccion: '',
        ciudad: '', // Assuming a city field might be added later or is part of address
        estado: 'Activo'
    });
    const [nextId, setNextId] = useState('Cargando...');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchNextId = async () => {
            try {
                const response = await api.get('/clients/next-id');
                const nextNum = response.next_id;
                const year = new Date().getFullYear();
                setNextId(`LC-${year}-${String(nextNum).padStart(4, '0')}`);
            } catch (err) {
                console.error('Error fetching clients for ID calculation:', err);
                setNextId('Autogenerado');
            }
        };
        fetchNextId();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);

            // The backend handles the integer ID, but the user wants to see LC format.
            // We'll save the client and the backend will assign the next integer.
            await api.post('/clients/', formData);

            setMessage({ type: 'success', text: 'Cliente registrado exitosamente.' });
            setTimeout(() => navigate('/clients'), 2000);
        } catch (err) {
            console.error('Error registering client:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Error al registrar el cliente.' });
        } finally {
            setLoading(false);
        }
    };

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
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Crear Nuevo Cliente</span>
            </div>

            {/* Page Header */}
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
                    Crear Nuevo Cliente
                </h1>
                <p style={{ color: '#92a4c9', fontSize: '0.9375rem' }}>
                    Ingrese los datos para registrar un nuevo perfil en el sistema.
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
                    color: message.type === 'success' ? '#22c55e' : '#ef4444'
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card style={{
                    padding: '2rem',
                    maxWidth: '900px',
                    background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                    border: '1px solid #324467',
                    borderRadius: '1rem'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Read Only ID */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#FFFFFF'
                            }}>
                                <Lock size={16} color="#6b7a92" />
                                ID de Sistema (Solo Lectura)
                            </label>
                            <input
                                type="text"
                                disabled
                                value={nextId}
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
                                Cédula / Identificación
                            </label>
                            <input
                                type="text"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{6,10}"
                                maxLength={10}
                                title="La cédula debe tener entre 6 y 10 dígitos numéricos"
                                placeholder="Ingrese el número de identificación"
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
                                placeholder="Nombres del cliente"
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
                                placeholder="Apellidos del cliente"
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
                                    placeholder="ejemplo@correo.com"
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
                                    placeholder="Dirección de residencia"
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
                                <Briefcase size={16} style={{
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
                                    placeholder="Ciudad de residencia"
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

                        {/* Service Required */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                                Servicio Requerido
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
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
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
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
                        {loading ? 'Guardando...' : 'Guardar Cliente'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegisterClient;
