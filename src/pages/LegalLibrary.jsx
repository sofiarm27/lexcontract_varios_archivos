import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Plus,
    Edit2,
    Trash2,
    Shield,
    X,
    Save,
    User,
    ChevronRight,
    Library,
    Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const LegalLibrary = () => {
    const navigate = useNavigate();
    const [userRole] = useState('Administrador');
    const [activeTab, setActiveTab] = useState('templates');

    const [templates, setTemplates] = useState([]);
    const [clauses, setClauses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [newItem, setNewItem] = useState({
        titulo: '',
        texto: '',
        tipo: 'Insolvencia Económica',
        clauses: []
    });

    const isAdmin = userRole === 'Administrador';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const [clausesData, templatesData] = await Promise.all([
                api.getClausulas(),
                api.getPlantillas()
            ]);
            setClauses(clausesData);
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error fetching library data:', error);
            setFetchError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        (t.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.tipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.variables_adicionales?.areaPractica || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredClauses = clauses.filter(c =>
        (c.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.clauses?.texto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.variables_adicionales?.areaPractica || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setNewItem({
                titulo: item.titulo || '',
                texto: item.clauses?.texto || '',
                tipo: item.tipo || 'General',
                clauses: item.clauses || []
            });
        } else {
            setEditingItem(null);
            setNewItem({
                titulo: '',
                texto: '',
                tipo: 'General',
                clauses: []
            });
        }
        setIsModalOpen(true);
    };

    const toggleClauseInTemplate = (clause) => {
        setNewItem(prev => {
            const currentClauses = prev.clauses || [];
            const exists = currentClauses.find(c => c.titulo === clause.titulo);
            if (exists) {
                return { ...prev, clauses: currentClauses.filter(c => c.titulo !== clause.titulo) };
            } else {
                return { ...prev, clauses: [...currentClauses, { titulo: clause.titulo, texto: clause.clauses?.texto || '' }] };
            }
        });
    };

    const handleSave = async () => {
        try {
            if (!newItem.titulo) {
                alert('Por favor ingrese un título.');
                return;
            }
            if (activeTab === 'templates') {
                const templateData = { titulo: newItem.titulo, tipo: newItem.tipo, clauses: newItem.clauses };
                if (editingItem) {
                    await api.updatePlantilla(editingItem.id, templateData);
                } else {
                    await api.createPlantilla(templateData);
                }
            } else {
                const clauseData = { titulo: newItem.titulo, texto: newItem.texto, tipo: newItem.tipo };
                if (editingItem) {
                    await api.updateClausula(editingItem.id, clauseData);
                } else {
                    await api.createClausula(clauseData);
                }
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        }
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const endpoint = activeTab === 'templates'
                ? `/contracts/plantilla/${itemToDelete.id}`
                : `/contracts/clausula/${itemToDelete.id}`;
            await api.delete(endpoint);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const currentItems = activeTab === 'templates' ? filteredTemplates : filteredClauses;

    return (
        <div style={{ color: 'white' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', color: '#92a4c9' }}>
                <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer' }}>Contratos</span>
                <span>›</span>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Biblioteca Legal</span>
            </div>

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Biblioteca Legal</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestione y seleccione plantillas o cláusulas predefinidas para sus contratos.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => handleOpenModal()} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }}>
                        <Plus size={18} />
                        Nueva {activeTab === 'templates' ? 'Plantilla' : 'Cláusula'}
                    </Button>
                )}
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e2d45' }}>
                <button
                    onClick={() => { setActiveTab('templates'); setSearchTerm(''); }}
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: activeTab === 'templates' ? '#D4AF37' : '#94a3b8',
                        fontWeight: activeTab === 'templates' ? 700 : 500,
                        borderBottom: activeTab === 'templates' ? '2px solid #D4AF37' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    PLANTILLAS
                </button>
                <button
                    onClick={() => { setActiveTab('clauses'); setSearchTerm(''); }}
                    style={{
                        padding: '1rem 0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: activeTab === 'clauses' ? '#D4AF37' : '#94a3b8',
                        fontWeight: activeTab === 'clauses' ? 700 : 500,
                        borderBottom: activeTab === 'clauses' ? '2px solid #D4AF37' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    CLÁUSULAS
                </button>
            </div>

            {/* Content Card */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#D4AF37' }} />
                </div>
            ) : (
                <Card>
                    {/* Search */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                placeholder={`Buscar ${activeTab === 'templates' ? 'plantillas' : 'cláusulas'}...`}
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
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>{activeTab === 'templates' ? 'Nombre' : 'Título'}</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Tipo</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>{activeTab === 'templates' ? 'Estado' : 'Fecha'}</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>ID</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchError ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                                            Error al cargar datos: {fetchError}
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No hay {activeTab === 'templates' ? 'plantillas' : 'cláusulas'} disponibles.{' '}
                                            {isAdmin && (
                                                <span
                                                    onClick={() => handleOpenModal()}
                                                    style={{ color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    Crear {activeTab === 'templates' ? 'plantilla' : 'cláusula'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ color: '#D4AF37' }}>
                                                        {activeTab === 'templates' ? <FileText size={20} /> : <Library size={20} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{item.titulo}</div>
                                                        {activeTab === 'clauses' && item.clauses?.texto && (
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.clauses.texto}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ color: '#60a5fa' }}>
                                                    {item.variables_adicionales?.areaPractica || item.tipo}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {activeTab === 'templates' ? (
                                                    <span style={{
                                                        padding: '0.25rem 0.625rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.75rem',
                                                        backgroundColor: item.estado === 'ACTIVO' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: item.estado === 'ACTIVO' ? '#22c55e' : '#ef4444'
                                                    }}>
                                                        {item.estado}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>{item.fecha}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8' }}>
                                                {item.id}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    {activeTab === 'templates' ? (
                                                        <Button
                                                            onClick={() => navigate(`/contracts/register?template=${item.id}`)}
                                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                                                        >
                                                            Usar
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => navigate(`/contracts/register?clause=${item.id}`)}
                                                            variant="outline"
                                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#D4AF37', borderColor: '#D4AF37' }}
                                                        >
                                                            Insertar
                                                        </Button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteClick(item)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                {editingItem ? 'Editar' : 'Nueva'} {activeTab === 'templates' ? 'Plantilla' : 'Cláusula'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    {activeTab === 'templates' ? 'Nombre de Plantilla' : 'Título de Cláusula'}
                                </label>
                                <input
                                    type="text"
                                    value={newItem.titulo}
                                    onChange={(e) => setNewItem({ ...newItem, titulo: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                />
                            </div>
                            {activeTab === 'clauses' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Contenido Legal</label>
                                    <textarea
                                        value={newItem.texto}
                                        onChange={(e) => setNewItem({ ...newItem, texto: e.target.value })}
                                        style={{ width: '100%', minHeight: '150px', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    />
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tipo</label>
                                    <select
                                        value={newItem.tipo}
                                        onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    >
                                        <option value="Insolvencia Económica">Insolvencia Económica</option>
                                    </select>
                                </div>
                            </div>
                            {activeTab === 'templates' && (
                                <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#D4AF37' }}>
                                        Cláusulas de la Plantilla ({newItem.clauses?.length || 0})
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                        {clauses.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No hay cláusulas disponibles para agregar.</p>
                                        ) : (
                                            clauses.map(clause => (
                                                <div
                                                    key={clause.id}
                                                    onClick={() => toggleClauseInTemplate(clause)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.6rem 0.8rem',
                                                        backgroundColor: newItem.clauses?.find(c => c.titulo === clause.titulo) ? 'rgba(212, 175, 55, 0.1)' : '#0a1423',
                                                        border: `1px solid ${newItem.clauses?.find(c => c.titulo === clause.titulo) ? '#D4AF37' : '#1e2d45'}`,
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8125rem',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #D4AF37',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: newItem.clauses?.find(c => c.titulo === clause.titulo) ? '#D4AF37' : 'transparent',
                                                        flexShrink: 0
                                                    }}>
                                                        {newItem.clauses?.find(c => c.titulo === clause.titulo) && <X size={12} color="#000" />}
                                                    </div>
                                                    <span style={{ color: newItem.clauses?.find(c => c.titulo === clause.titulo) ? 'white' : '#94a3b8', flex: 1 }}>{clause.titulo}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            <Button onClick={handleSave} style={{ backgroundColor: '#D4AF37', color: '#000', marginTop: '1rem' }}>
                                <Save size={18} />
                                {editingItem ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#0f1621', border: '1px solid #324467', borderRadius: '1.25rem',
                        padding: '2.5rem', width: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                    }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Confirmar Eliminación
                        </h2>
                        <p style={{ color: '#92a4c9', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            ¿Estás seguro de que deseas eliminar {activeTab === 'templates' ? 'la plantilla' : 'la cláusula'}{' '}
                            <span style={{ color: '#D4AF37', fontWeight: 600 }}>{itemToDelete?.titulo}</span>? Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{ padding: '0.75rem 1.5rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e2d45', borderRadius: '0.75rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalLibrary;
