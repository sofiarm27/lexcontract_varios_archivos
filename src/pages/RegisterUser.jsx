import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Shield, Save, X, CreditCard, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const RegisterUser = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        celular: '',
        correo: '',
        password: '',
        rol: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Password validation
        const pass = formData.password;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasLength = pass.length >= 8;

        if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
            setMessage({
                type: 'error',
                text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
            });
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage(null);

            // Fetch roles to get the ID for the selected name
            // Fetch roles to get correct IDs
            const rolesResponse = await api.get('/roles/');
            const adminRole = rolesResponse.find(r => r.nombre.toLowerCase() === 'administrador');
            const lawyerRole = rolesResponse.find(r => r.nombre.toLowerCase() === 'abogado');

            let roles_ids = [];
            if (formData.rol === 'Abogado/Administrador') {
                if (lawyerRole) roles_ids.push(lawyerRole.id);
                if (adminRole) roles_ids.push(adminRole.id);
            } else {
                const selectedRole = rolesResponse.find(r => r.nombre.toLowerCase() === formData.rol.toLowerCase());
                if (selectedRole) roles_ids = [selectedRole.id];
            }

            if (roles_ids.length === 0) {
                throw new Error('Rol no válido o no encontrado');
            }

            const payload = {
                ...formData,
                roles_ids: roles_ids
            };
            delete payload.rol;

            await api.post('/users/', payload);

            setMessage({ type: 'success', text: 'Usuario registrado exitosamente.' });
            setTimeout(() => navigate('/users'), 2000);
        } catch (err) {
            console.error('Error registering user:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.detail || err.message || 'Error al registrar el usuario.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ color: 'white', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#92a4c9'
            }}>
                <span onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>Usuarios / Roles</span>
                <span>›</span>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Registrar Nuevo Usuario</span>
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Registrar Nuevo Usuario</h1>
                <p style={{ color: '#92a4c9', fontSize: '1rem' }}>
                    Ingrese los datos del nuevo miembro del equipo. Este registro permitirá el acceso inmediato al sistema con las credenciales proporcionadas.
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

            <Card style={{ padding: '2.5rem', background: '#111d2e', border: '1px solid #1e2d45' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Nombre */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Nombre</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Juan"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                        {/* Apellido */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Apellido</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Pérez"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Cédula */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Cédula</label>
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{6,10}"
                                    maxLength={10}
                                    title="La cédula debe tener entre 6 y 10 dígitos numéricos"
                                    placeholder="Número de identificación"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                        {/* Celular */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Número de Celular</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    name="celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    title="El celular debe tener exactamente 10 dígitos numéricos"
                                    placeholder="3001234567"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Correo Electrónico */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                    placeholder="usuario@lexcontract.com"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                        {/* Contraseña */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="8+ car, Mayús, Minús, Núm"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem 1rem 3.25rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.5rem',
                                    marginTop: '0.75rem',
                                    fontSize: '0.75rem',
                                    textAlign: 'left'
                                }}>
                                    {[
                                        { label: '8+ caracteres', met: formData.password.length >= 8 },
                                        { label: 'Una mayúscula', met: /[A-Z]/.test(formData.password) },
                                        { label: 'Una minúscula', met: /[a-z]/.test(formData.password) },
                                        { label: 'Un número', met: /[0-9]/.test(formData.password) }
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
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white' }}>Asignar Rol</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem 1rem 3.25rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    appearance: 'none'
                                }}
                            >
                                <option value="">Seleccionar rol</option>
                                <option value="Abogado">Abogado</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Abogado/Administrador">Abogado/Administrador</option>
                            </select>
                            <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'white', pointerEvents: 'none' }}>
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/users')}
                            style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: 700, borderColor: '#1e2d45', color: 'white' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            style={{
                                padding: '0.875rem 2.5rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                backgroundColor: '#D4AF37',
                                color: '#000',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Registrar Usuario
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

        </div>
    );
};

export default RegisterUser;
