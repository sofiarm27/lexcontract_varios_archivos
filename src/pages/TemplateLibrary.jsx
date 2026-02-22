import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    Calendar,
    Briefcase,
    Shield,
    X,
    Save,
    ArrowLeft
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const TemplateLibrary = () => {
    const navigate = useNavigate();
    const [userRole] = useState('Administrador'); // Hardcoded for demo

    const [templates, setTemplates] = useState([
        { id: 1, nombre: 'Contrato de Insolvencia Económica', tipo: 'Insolvencia', ultimaMod: '2026-02-10', autor: 'Admin Lex' },
        { id: 2, nombre: 'Acuerdo de Pago General', tipo: 'Financiero', ultimaMod: '2026-02-05', autor: 'Elena Sterling' },
        { id: 3, nombre: 'Contrato de Arrendamiento Comercial', tipo: 'Civil', ultimaMod: '2026-01-20', autor: 'Admin Lex' },
        { id: 4, nombre: 'Prestación de Servicios Técnicos', tipo: 'Servicios', ultimaMod: '2026-01-15', autor: 'Alejandro Vance' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({ nombre: '', tipo: 'Civil', autor: 'Admin Lex' });

    const isAdmin = userRole === 'Administrador';

    const filteredTemplates = templates.filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setNewTemplate({ ...template });
        } else {
            setEditingTemplate(null);
            setNewTemplate({ nombre: '', tipo: 'Civil', autor: 'Admin Lex' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const today = new Date().toISOString().split('T')[0];
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...newTemplate, id: t.id, ultimaMod: today } : t));
        } else {
            setTemplates([...templates, { ...newTemplate, id: Date.now(), ultimaMod: today }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar esta plantilla?')) {
            setTemplates(templates.filter(t => t.id !== id));
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
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Biblioteca de Plantillas</span>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Biblioteca de Plantillas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Seleccione un modelo base o gestione las plantillas legales de la firma.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate('/contracts/clauses')} style={{ borderColor: '#1e2d45', color: 'white' }}>
                        <Shield size={18} />
                        Gestionar Cláusulas
                    </Button>
                    {isAdmin && (
                        <Button onClick={() => handleOpenModal()} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none' }}>
                            <Plus size={18} />
                            Nueva Plantilla
                        </Button>
                    )}
                </div>
            </header>

            <Card style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Buscar plantillas por nombre o tipo..."
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
                                <th style={{ padding: '1.25rem 1.5rem' }}>Nombre de Plantilla</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Tipo</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Última Modificación</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Autor</th>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTemplates.map((tpl) => (
                                <tr key={tpl.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', padding: '0.5rem', borderRadius: '0.375rem' }}>
                                                <FileText size={18} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{tpl.nombre}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.25rem 0.625rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                                            {tpl.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>{tpl.ultimaMod}</td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8' }}>{tpl.autor}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Button
                                                onClick={() => navigate(`/contracts/register?template=${tpl.id}`)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                    color: '#22c55e',
                                                    border: '1px solid #22c55e'
                                                }}
                                            >
                                                Usar plantilla
                                            </Button>
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenModal(tpl)}
                                                        style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer' }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tpl.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
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
                    <Card style={{ width: '450px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nombre de la Plantilla</label>
                                <input
                                    type="text"
                                    value={newTemplate.nombre}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    placeholder="Ej: Contrato de Arrendamiento VIP"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Categoría / Tipo</label>
                                <select
                                    value={newTemplate.tipo}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, tipo: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                >
                                    <option value="Insolvencia Económica">Insolvencia Económica</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Autor</label>
                                <input
                                    type="text"
                                    value={newTemplate.autor}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, autor: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                />
                            </div>
                            <Button onClick={handleSave} style={{ backgroundColor: '#D4AF37', color: '#000', marginTop: '1rem' }}>
                                <Save size={18} />
                                {editingTemplate ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default TemplateLibrary;
