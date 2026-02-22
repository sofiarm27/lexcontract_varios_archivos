import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Edit2, Trash2, Plus, UserPlus, X, Phone, Mail, MapPin, Building, CreditCard } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const Clients = () => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientToDelete, setClientToDelete] = useState(null);
    const [cityFilter, setCityFilter] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientsData, setClientsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const data = await api.get('/clients/');
                setClientsData(data);
            } catch (err) {
                setError('No se pudieron cargar los clientes.');
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

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
                maxWidth: '600px',
                borderRadius: '1.25rem',
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
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--accent-gold)' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );


    const cities = [...new Set(clientsData.map(c => c.ciudad))];

    const filteredClients = clientsData.filter(client => {
        const displayId = `LC-2025-${String(client.id).padStart(4, '0')}`;
        const matchesSearch =
            (client.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.cedula || '').includes(searchTerm) ||
            displayId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCity = cityFilter === '' || client.ciudad === cityFilter;

        return matchesSearch && matchesCity;
    });

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await api.delete(`/clients/${clientToDelete.id}`);
            setClientsData(prev => prev.filter(c => c.id !== clientToDelete.id));
            setShowDeleteModal(false);
            setClientToDelete(null);
            /* showToast('Cliente eliminado exitosamente'); */
        } catch (err) {
            console.error('Error deleting client:', err);
            alert('No se pudo eliminar el cliente.');
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando expedientes...</div>;
    }

    if (error) {
        return <div style={{ color: '#ef4444', textAlign: 'center', padding: '5rem' }}>{error}</div>;
    }

    return (
        <div style={{ color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Módulo de Clientes</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Administración centralizada de expedientes de clientes.</p>
                </div>
                <Button onClick={() => navigate('/clients/register')} style={{ padding: '0.75rem 1.5rem' }}>
                    <UserPlus size={18} />
                    Crear Nuevo Cliente
                </Button>
            </header>

            <Card style={{ padding: '0' }}>
                {/* Filters / Search Bar */}
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por Nombre, Cédula o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                backgroundColor: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative', minWidth: '200px' }}>
                        <Filter style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                backgroundColor: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Todas las ciudades</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--accent-gold)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>ID Cliente</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Cédula</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Nombre Completo</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Celular</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Dirección</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Ciudad</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Servicio</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                                        {`LC-2025-${String(client.id).padStart(4, '0')}`}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{client.cedula}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                        <div
                                            onClick={() => { setSelectedClient(client); setIsDetailModalOpen(true); }}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.color = 'var(--accent-gold)'}
                                            onMouseOut={(e) => e.target.style.color = 'white'}
                                        >
                                            {client.nombre}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{client.celular}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{client.direccion}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{client.ciudad}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--accent-gold)',
                                            backgroundColor: 'rgba(212, 175, 55, 0.05)'
                                        }}>
                                            Insolvencia
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => navigate(`/clients/edit/${client.id}`)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(client)}
                                                style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.4rem' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>Mostrando {filteredClients.length} de {clientsData.length} registros</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, '...', 10].map((page, i) => (
                            <button key={i} style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid var(--border-color)',
                                backgroundColor: page === 1 ? 'var(--accent-gold)' : 'transparent',
                                color: page === 1 ? '#000' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}>
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Client Details Modal */}
            {isDetailModalOpen && selectedClient && (
                <Modal title="Expediente del Cliente" onClose={() => setIsDetailModalOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #1e2d45', paddingBottom: '1.5rem' }}>
                        <div style={{
                            backgroundColor: 'var(--accent-gold)',
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
                            <UserPlus size={32} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>{selectedClient.nombre}</h4>
                            <div style={{ color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>ID: {selectedClient.id}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={14} /> Identificación
                            </label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.cedula}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={14} /> Celular
                            </label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.celular}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={14} /> Correo Electrónico
                            </label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.correo}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} /> Dirección de Residencia
                            </label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.direccion}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Building size={14} /> Ciudad
                            </label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.ciudad}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Servicio</label>
                            <div style={{ fontSize: '1rem', color: '#f8fafc' }}>{selectedClient.servicio || 'Insolvencia Económica'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Estado del Expediente</label>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                width: 'fit-content',
                                backgroundColor: selectedClient.estado === 'Activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: selectedClient.estado === 'Activo' ? '#22c55e' : '#ef4444'
                            }}>
                                {selectedClient.estado}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <Button style={{ backgroundColor: '#1e2d45', color: 'white' }} onClick={() => setIsDetailModalOpen(false)}>Cerrar Expediente</Button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && clientToDelete && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <Card style={{
                        width: '90%',
                        maxWidth: '450px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: '#111d2e',
                        border: '1px solid #1e2d45',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            marginBottom: '0.5rem'
                        }}>
                            <Trash2 size={40} />
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>¿Eliminar Cliente?</h3>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                                Está a punto de eliminar el expediente de <strong style={{ color: 'white' }}>{clientToDelete.nombre}</strong>. Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                                style={{ flex: 1, borderColor: '#1e2d45', color: 'white' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Clients;
