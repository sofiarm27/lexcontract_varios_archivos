import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Filter as FilterIcon,
    Edit2,
    UserX,
    Unlock,
    UserPlus,
    Briefcase,
    Users as UsersIcon,
    X,
    Save,
    Lock as LockIcon,
    Shield,
    Mail,
    Phone,
    User as UserIcon,
    AlertCircle
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const Users = () => {
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ nombre: '', correo: '', roles_ids: [], estado: '' });
    const [editRoleSelection, setEditRoleSelection] = useState(''); // NEW: Controls the simple dropdown logic

    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isForbidden, setIsForbidden] = useState(false);
    const [roles, setRoles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Todos');

    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const [users, rolesData] = await Promise.all([
                    api.get('/users/'),
                    api.get('/roles/')
                ]);
                setUsersData(users);
                setRoles(rolesData);
            } catch (err) {
                if (err.message.includes('403') || err.message.includes('permisos')) {
                    setIsForbidden(true);
                } else {
                    setError('No se pudieron cargar los datos.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const openEditModal = (user) => {
        setSelectedUser(user);

        // Determine initial dropdown value based on user roles
        const userRoleIds = user.roles.map(r => r.id);
        const adminRole = roles.find(r => r.nombre.toLowerCase() === 'administrador');
        const lawyerRole = roles.find(r => r.nombre.toLowerCase() === 'abogado');

        let initialSelection = '';
        if (adminRole && lawyerRole && userRoleIds.includes(adminRole.id) && userRoleIds.includes(lawyerRole.id)) {
            initialSelection = 'BOTH';
        } else if (userRoleIds.length > 0) {
            initialSelection = userRoleIds[0].toString();
        }

        setEditRoleSelection(initialSelection);
        setEditForm({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            cedula: user.cedula,
            celular: user.celular,
            correo: user.correo,
            roles_ids: userRoleIds,
            estado: user.estado,
            biografia: user.biografia
        });
        setIsEditModalOpen(true);
    };

    const openBlockModal = (user) => {
        setSelectedUser(user);
        setIsBlockModalOpen(true);
    };

    const openDetailModal = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsBlockModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedUser(null);
    };

    const toggleUserStatus = async (user) => {
        const newStatus = user.estado === 'Bloqueado' ? 'Activo' : 'Bloqueado';
        try {
            const updatedUser = await api.put(`/users/${user.id}`, { estado: newStatus });
            setUsersData(usersData.map(u =>
                u.id === user.id ? updatedUser : u
            ));
            closeModal();
        } catch (err) {
            console.error("Error toggling user status:", err);
            alert("No se pudo actualizar el estado del usuario.");
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            setError(null);
            setSuccessMessage(null);
            const updatedUser = await api.put(`/users/${editForm.id}`, {
                nombre: editForm.nombre,
                apellido: editForm.apellido,
                celular: editForm.celular,
                correo: editForm.correo,
                roles_ids: editForm.roles_ids, // Send list of IDs
                estado: editForm.estado,
                biografia: editForm.biografia
            });

            // Update local state - Map back selected roles for display
            const updatedRoles = roles.filter(r => editForm.roles_ids.includes(r.id));
            setUsersData(usersData.map(u => u.id === editForm.id ? { ...updatedUser, roles: updatedRoles } : u));
            setSuccessMessage("Cambios guardados correctamente.");
            setTimeout(() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setSuccessMessage(null);
            }, 1000);
        } catch (err) {
            console.error("Error saving user edit:", err);
            setError("No se pudieron guardar los cambios.");
        }
    };

    const filteredUsers = usersData.filter(user => {
        const matchesSearch =
            (user.nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (user.correo?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (user.roles && user.roles.some(r => r.nombre.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesRole = roleFilter === 'Todos' || (
            roleFilter === 'Abogado' ? (user.roles?.length === 1 && user.roles[0].nombre === 'Abogado') :
                roleFilter === 'Administrador' ? (user.roles?.length === 1 && user.roles[0].nombre === 'Administrador') :
                    roleFilter === 'Ambos' ? (user.roles?.some(r => r.nombre === 'Abogado') && user.roles?.some(r => r.nombre === 'Administrador')) :
                        false
        );

        return matchesSearch && matchesRole;
    });

    // --- Modal Component ---
    const Modal = ({ title, onClose, children }) => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: '#0d1a2d',
                width: '100%',
                maxWidth: '550px',
                borderRadius: '1rem',
                border: '1px solid #1e2d45',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    padding: '1.25rem 2rem',
                    borderBottom: '1px solid #1e2d45',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(30, 45, 69, 0.3)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#D4AF37' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );

    if (isForbidden) {
        return (
            <div style={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '50%', color: '#ef4444' }}>
                    <LockIcon size={64} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Acceso Restringido</h2>
                    <p style={{ color: '#92a4c9', maxWidth: '400px' }}>
                        Solo los administradores tienen permiso para gestionar usuarios y roles.
                        Si cree que esto es un error, contacte al soporte técnico.
                    </p>
                </div>
                <Button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }}>
                    Volver al Dashboard
                </Button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando usuarios...</div>;
    }

    return (
        <div style={{ color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gestión de Usuarios y Roles</h1>
                    <p style={{ color: '#92a4c9' }}>Administre los permisos y roles de los miembros de su equipo legal y administrativo.</p>
                </div>
                <Button onClick={() => navigate('/users/register')} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }}>
                    <UserPlus size={18} />
                    Registrar Usuario
                </Button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Card style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0d1a2d', border: '1px solid #1e2d45' }}>
                    <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#D4AF37' }}>
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Abogados</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            {usersData.filter(u =>
                                u.roles?.some(r => r.nombre.toLowerCase().includes('abogado')) &&
                                !u.roles?.some(r => r.nombre.toLowerCase() === 'administrador')
                            ).length}
                        </h3>
                    </div>
                </Card>
                <Card style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0d1a2d', border: '1px solid #1e2d45' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#60a5fa' }}>
                        <UsersIcon size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Administrativos</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            {usersData.filter(u =>
                                u.roles?.some(r => r.nombre.toLowerCase() === 'administrador') &&
                                !u.roles?.some(r => r.nombre.toLowerCase().includes('abogado'))
                            ).length}
                        </h3>
                    </div>
                </Card>
                <Card style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0d1a2d', border: '1px solid #1e2d45' }}>
                    <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#a855f7' }}>
                        <Shield size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Admin/Abogado</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            {usersData.filter(u =>
                                u.roles?.some(r => r.nombre.toLowerCase().includes('abogado')) &&
                                u.roles?.some(r => r.nombre.toLowerCase() === 'administrador')
                            ).length}
                        </h3>
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '0', background: '#0d1a2d', border: '1px solid #1e2d45' }}>
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #1e2d45' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, nombre, correo o rol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                backgroundColor: '#0a1423',
                                border: '1px solid #1e2d45',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ padding: '0.75rem 1rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="Todos">Rol: Todos</option>
                        <option value="Abogado">Solo Abogado</option>
                        <option value="Administrador">Solo Administrador</option>
                        <option value="Ambos">Abogado/Administrador</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #1e2d45', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Usuario</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Rol de Sistema</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Contratos Asoc.</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Estado</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #1e2d45', fontSize: '0.875rem' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ backgroundColor: '#D4AF37', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>
                                                {user.nombre.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div
                                                    onClick={() => openDetailModal(user)}
                                                    style={{
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                                                    onMouseOut={(e) => e.target.style.color = 'white'}
                                                >
                                                    {user.nombre}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.correo}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ color: 'white' }}>
                                            {user.roles && user.roles.length > 0
                                                ? (
                                                    (user.roles.some(r => r.nombre.toLowerCase() === 'administrador') &&
                                                        user.roles.some(r => r.nombre.toLowerCase().includes('abogado')))
                                                        ? 'Administrador / Abogado'
                                                        : user.roles.map(r => r.nombre).join(', ')
                                                )
                                                : 'Sin Rol'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{user.contratos} contrato(s)</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: user.estado === 'Activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: user.estado === 'Activo' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {user.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                style={{ background: 'rgba(212, 175, 55, 0.1)', border: 'none', color: '#D4AF37', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.375rem' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => openBlockModal(user)}
                                                style={{
                                                    background: user.estado === 'Bloqueado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                    border: 'none',
                                                    color: user.estado === 'Bloqueado' ? '#ef4444' : '#22c55e',
                                                    cursor: 'pointer',
                                                    padding: '0.4rem',
                                                    borderRadius: '0.375rem'
                                                }}
                                            >
                                                {user.estado === 'Bloqueado' ? <LockIcon size={16} /> : <Unlock size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* --- Modals Implementation --- */}

            {isEditModalOpen && selectedUser && (
                <Modal title="Editar Perfil de Usuario" onClose={closeModal}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Nombre Completo</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    name="nombre"
                                    value={editForm.nombre}
                                    onChange={handleEditChange}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cédula (No editable)</label>
                            <div style={{ position: 'relative' }}>
                                <AlertCircle size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    value={editForm.cedula}
                                    disabled
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: 'rgba(30, 45, 69, 0.4)', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: '#64748b', outline: 'none', cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="email"
                                    name="correo"
                                    value={editForm.correo}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Número de Celular</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    name="celular"
                                    value={editForm.celular}
                                    onChange={handleEditChange}
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    title="El celular debe tener exactamente 10 dígitos numéricos"
                                    placeholder="Ej: 3001234567"
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Rol de Sistema</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <select
                                        name="rol_selection"
                                        value={editRoleSelection}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEditRoleSelection(val);

                                            // Validate roles existence from state
                                            const adminRole = roles.find(r => r.nombre.toLowerCase() === 'administrador');
                                            const lawyerRole = roles.find(r => r.nombre.toLowerCase() === 'abogado');

                                            if (val === 'BOTH' && adminRole && lawyerRole) {
                                                setEditForm({ ...editForm, roles_ids: [adminRole.id, lawyerRole.id] });
                                            } else if (val !== '') {
                                                setEditForm({ ...editForm, roles_ids: [parseInt(val)] });
                                            } else {
                                                setEditForm({ ...editForm, roles_ids: [] });
                                            }
                                        }}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="">Seleccione un rol</option>
                                        {roles.filter(r => ['administrador', 'abogado'].includes(r.nombre.toLowerCase())).map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                        <option value="BOTH">Administrador / Abogado</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Estado de Cuenta</label>
                                <div style={{ position: 'relative' }}>
                                    <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <select
                                        name="estado"
                                        value={editForm.estado}
                                        onChange={handleEditChange}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                        <option value="Bloqueado">Bloqueado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {successMessage && (
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="outline" onClick={closeModal} style={{ borderColor: '#1e2d45', color: 'white' }}>Cancelar</Button>
                            <Button style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }} onClick={handleSaveEdit}>
                                <Save size={18} />
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* User Details Modal */}
            {isDetailModalOpen && selectedUser && (
                <Modal title="Información Detallada del Usuario" onClose={closeModal}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #1e2d45', paddingBottom: '1.5rem' }}>
                            <div style={{
                                backgroundColor: '#D4AF37',
                                width: '64px',
                                height: '64px',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000',
                                fontSize: '1.5rem',
                                fontWeight: 800
                            }}>
                                <UserIcon size={32} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>{selectedUser.nombre}</h4>
                                <div style={{ color: '#D4AF37', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <Shield size={14} />
                                    {selectedUser.roles?.map(r => r.nombre).join(', ') || 'Sin Rol'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FilterIcon size={14} /> Identificación
                                </label>
                                <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedUser.cedula || 'No registrada'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={14} /> ID Usuario
                                </label>
                                <div style={{ fontSize: '1rem', color: '#f8fafc' }}>#{String(selectedUser.id).padStart(4, '0')}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UsersIcon size={14} /> Celular
                                </label>
                                <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedUser.celular || 'No registrado'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={14} /> Email
                                </label>
                                <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedUser.correo}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Estado</label>
                                <span style={{
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    width: 'fit-content',
                                    backgroundColor: selectedUser.estado === 'Activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: selectedUser.estado === 'Activo' ? '#22c55e' : '#ef4444'
                                }}>
                                    {selectedUser.estado}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Contratos</label>
                                <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedUser.contratos} expedientes</div>
                            </div>
                        </div>

                        {selectedUser.motivo && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                borderRadius: '0.5rem'
                            }}>
                                <label style={{ fontSize: '0.725rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>Razones de Bloqueo:</label>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>{selectedUser.motivo}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button style={{ backgroundColor: '#1e2d45', color: 'white' }} onClick={closeModal}>Cerrar Perfil</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Block/Unlock Modal */}
            {isBlockModalOpen && selectedUser && (
                <Modal title={selectedUser.estado === 'Bloqueado' ? 'Desbloquear Acceso' : 'Bloquear Acceso'} onClose={closeModal}>
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: selectedUser.estado === 'Bloqueado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: selectedUser.estado === 'Bloqueado' ? '#22c55e' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                        }}>
                            {selectedUser.estado === 'Bloqueado' ? <Unlock size={32} /> : <LockIcon size={32} />}
                        </div>

                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                ¿Desea {selectedUser.estado === 'Bloqueado' ? 'restaurar' : 'restringir'} el acceso?
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                                Está a punto de {selectedUser.estado === 'Bloqueado' ? 'habilitar' : 'bloquear'} la cuenta de <strong>{selectedUser.nombre}</strong>.
                                {selectedUser.estado !== 'Bloqueado' && ' El usuario no podrá iniciar sesión hasta que se restablezca su acceso.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <Button variant="outline" onClick={closeModal} style={{ borderColor: '#1e2d45', color: 'white' }}>Ignorar</Button>
                            <Button
                                onClick={() => toggleUserStatus(selectedUser)}
                                style={{
                                    backgroundColor: selectedUser.estado === 'Bloqueado' ? '#22c55e' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Confirmar Acción
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Users;
