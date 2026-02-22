import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    X,
    Save,
    ArrowLeft,
    Clock,
    User
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const ClauseLibrary = () => {
    const navigate = useNavigate();

    const [clauses, setClauses] = useState([
        { id: 1, titulo: 'Objeto del Contrato - Insolvencia', contenido: 'LA EMPRESA se compromete a prestar servicios de asesoría jurídica especializada a EL CLIENTE, centrados en la gestión de Insolvencia Económica...', tipo: 'Insolvencia', estado: 'Activa', fecha: '2026-02-10', autor: 'Admin Lex' },
        { id: 2, titulo: 'Honorarios y Pagos Standard', contenido: 'Como contraprestación, EL CLIENTE pagará la suma pactada en la modalidad de pago único o abonos según se defina...', tipo: 'Financiero', estado: 'Activa', fecha: '2026-02-05', autor: 'Elena Sterling' },
        { id: 3, titulo: 'Vigencia y Prórroga', contenido: 'El presente contrato tendrá una vigencia definida desde la firma hasta el cumplimiento del objeto contractual...', tipo: 'General', estado: 'Inactiva', fecha: '2026-01-20', autor: 'Admin Lex' },
        { id: 4, titulo: 'Confidencialidad', contenido: 'Las partes se obligan a mantener absoluta reserva sobre toda la información intercambiada durante la ejecución...', tipo: 'Legal', estado: 'Activa', fecha: '2026-01-15', autor: 'Alejandro Vance' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClause, setEditingClause] = useState(null);
    const [newClause, setNewClause] = useState({ titulo: '', contenido: '', tipo: 'General', estado: 'Activa' });

    const filteredClauses = clauses.filter(c =>
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contenido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (clause = null) => {
        if (clause) {
            setEditingClause(clause);
            setNewClause({ ...clause });
        } else {
            setEditingClause(null);
            setNewClause({ titulo: '', contenido: '', tipo: 'General', estado: 'Activa' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingClause) {
            setClauses(clauses.map(c => c.id === editingClause.id ? { ...newClause, id: c.id, fecha: new Date().toISOString().split('T')[0], autor: 'Admin Lex' } : c));
        } else {
            setClauses([...clauses, { ...newClause, id: Date.now(), fecha: new Date().toISOString().split('T')[0], autor: 'Admin Lex' }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar esta cláusula?')) {
            setClauses(clauses.filter(c => c.id !== id));
        }
    };

    return (
        <div style={{ color: 'white' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#92a4c9'
            }}>
                <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer' }}>Contratos</span>
                <span>›</span>
                <span onClick={() => navigate('/contracts/templates')} style={{ cursor: 'pointer' }}>Biblioteca de Plantillas</span>
                <span>›</span>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Gestión de Cláusulas</span>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Repositorio de Cláusulas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Administre los bloques de texto legales reutilizables para sus contratos.</p>
                </div>
                <Button onClick={() => handleOpenModal()} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }}>
                    <Plus size={18} />
                    Nueva Cláusula
                </Button>
            </header>

            <Card style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cláusulas por título o contenido..."
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

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Título de Cláusula</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Tipo / Categoría</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Estado</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Creado Por</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClauses.map((clause) => (
                                <tr key={clause.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{clause.titulo}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {clause.contenido}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ color: '#60a5fa' }}>{clause.tipo}</span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: clause.estado === 'Activa' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: clause.estado === 'Activa' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {clause.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                                            <User size={14} />
                                            {clause.autor}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => handleOpenModal(clause)}
                                                style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(clause.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
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
            </Card>

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingClause ? 'Editar Cláusula' : 'Nueva Cláusula'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Título</label>
                                <input
                                    type="text"
                                    value={newClause.titulo}
                                    onChange={(e) => setNewClause({ ...newClause, titulo: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Contenido</label>
                                <textarea
                                    value={newClause.contenido}
                                    onChange={(e) => setNewClause({ ...newClause, contenido: e.target.value })}
                                    style={{ width: '100%', minHeight: '150px', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tipo</label>
                                    <select
                                        value={newClause.tipo}
                                        onChange={(e) => setNewClause({ ...newClause, tipo: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    >
                                        <option value="Insolvencia Económica">Insolvencia Económica</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Estado</label>
                                    <select
                                        value={newClause.estado}
                                        onChange={(e) => setNewClause({ ...newClause, estado: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    >
                                        <option value="Activa">Activa</option>
                                        <option value="Inactiva">Inactiva</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={handleSave} style={{ backgroundColor: '#D4AF37', color: '#000', marginTop: '1rem' }}>
                                <Save size={18} />
                                {editingClause ? 'Actualizar Cláusula' : 'Guardar Cláusula'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClauseLibrary;
