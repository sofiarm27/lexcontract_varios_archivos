import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Edit2,
    Eye,
    Plus,
    ChevronDown,
    X,
    Save,
    Download,
    FileText,
    User,
    Calendar,
    Briefcase,
    Trash2,
    DollarSign
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const Contracts = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedContract, setSelectedContract] = useState(null);
    const [editFormData, setEditFormData] = useState({
        estado: '',
        abogado_id: '',
        titulo: ''
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);
    const pdfRef = useRef(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [lawyerFilter, setLawyerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Clean up any local storage clutter if necessary
                localStorage.removeItem('cached_lawyers');

                const [contractsData, lawyersData] = await Promise.all([
                    api.get('/contracts/'),
                    api.get('/users/abogados')
                ]);
                setContracts(contractsData);
                setLawyers(lawyersData);
            } catch (err) {
                console.error('Error fetching contracts data:', err);
                setError('No se pudieron cargar los contratos o abogados.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredContracts = contracts.filter(contract => {
        if (!contract) return false;

        const clientFull = `${contract.cliente?.nombre || ''} ${contract.cliente?.apellido || ''}`.toLowerCase();
        const contractIdStr = String(contract.id || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            contractIdStr.includes(searchLower) ||
            clientFull.includes(searchLower);

        const matchesLawyer = lawyerFilter === '' || String(contract.abogado_id || '') === lawyerFilter;
        const matchesStatus = statusFilter === '' || (contract.estado || '').toUpperCase() === statusFilter.toUpperCase();

        return matchesSearch && matchesLawyer && matchesStatus;
    });

    const openEditModal = (contract) => {
        setSelectedContract(contract);
        setEditFormData({
            estado: contract.estado || 'BORRADOR',
            abogado_id: contract.abogado?.id || '',
            titulo: contract.titulo || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            if (!selectedContract) return;

            // Prepare update payload
            const payload = {
                estado: editFormData.estado.toUpperCase(),
                abogado_id: editFormData.abogado_id ? parseInt(editFormData.abogado_id) : null
            };

            await api.put(`/contracts/${selectedContract.id}`, payload);

            // Update local state
            setContracts(prev => prev.map(c =>
                c.id === selectedContract.id
                    ? { ...c, estado: payload.estado, abogado: lawyers.find(l => l.id === payload.abogado_id) || c.abogado }
                    : c
            ));

            /* showToast('Contrato actualizado correctamente'); */
            alert('Contrato actualizado correctamente');
            closeModal();
        } catch (error) {
            console.error('Error updating contract:', error);
            alert('Error al actualizar el contrato');
        }
    };

    const openPreviewModal = (contract) => {
        setSelectedContract(contract);
        setIsPreviewModalOpen(true);
    };

    const exportToPDF = async () => {
        const element = pdfRef.current;
        if (!element || !selectedContract) return;

        // Clone and adapt visibility for PDF rendering
        element.style.display = 'block';
        element.style.position = 'absolute';
        element.style.left = '-9999px';

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Contrato_${selectedContract.id}_${selectedContract.cliente?.nombre || 'Doc'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF.');
        } finally {
            element.style.display = 'none';
        }
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsPreviewModalOpen(false);
        setSelectedContract(null);
    };

    const handleDeleteClick = (contract) => {
        setContractToDelete(contract);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!contractToDelete) return;
        try {
            await api.delete(`/contracts/${contractToDelete.id}`);
            setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
            setShowDeleteModal(false);
            setContractToDelete(null);
            alert('Contrato eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting contract:', error);
            alert('Error al eliminar el contrato');
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando contratos...</div>;
    }

    if (error) {
        return <div style={{ color: '#ef4444', textAlign: 'center', padding: '5rem' }}>{error}</div>;
    }

    // --- Modal Components ---
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
                maxWidth: title === 'Vista Previa de Contrato' ? '900px' : '600px',
                maxHeight: '90vh',
                borderRadius: '1rem',
                border: '1px solid #1e2d45',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden'
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
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                        <X size={24} />
                    </button>
                </div>
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );

    // Helper to replace placeholders for preview
    const renderPreviewContent = (content, contract) => {
        if (!content) return '';
        let live = content;

        const displayTipo = contract.tipo && contract.tipo !== 'plantilla'
            ? contract.tipo
            : (contract.variables_adicionales?.areaPractica || 'Insolvencia Económica');

        // Create a base mapping with standard fields derived from the contract object
        const baseMapping = {
            'Nombre Cliente': contract.cliente ? `${contract.cliente.nombre} ${contract.cliente.apellido || ''}` : '____________________',
            'DNI Cliente': contract.cliente ? contract.cliente.cedula : '__________',
            'Identificación Cliente': contract.cliente ? contract.cliente.cedula : '__________',
            'Área de Práctica': displayTipo,
            'Representante Legal': contract.abogado ? `${contract.abogado.nombre} ${contract.abogado.apellido}` : (contract.variables_adicionales?.representanteLegal || 'ADMIN LEX'),
            'Valor Honorarios': contract.total ? String(contract.total) : '0.00',
            'Fecha Inicio': contract.fecha || '__________',
            'Modalidad Pago': contract.variables_adicionales?.modalidadPago === 'unico' ? 'Pago Único' : (contract.variables_adicionales?.modalidadPago || '__________'),
            'Valor Penalidad': contract.variables_adicionales?.valorPenalidad?.toString() || '0.00',
            'Identificación': contract.cliente ? contract.cliente.cedula : '__________',
            'Identificación de Cliente': contract.cliente ? contract.cliente.cedula : '__________',
        };

        // Combine base mapping with ALL variables stored in variables_adicionales
        // This ensures "Quick Fill" variables (which often have spaces in keys) are caught
        const fullMapping = {
            ...baseMapping,
            ...(contract.variables_adicionales || {}),
        };

        // Final bridge for specific common aliases that might be missed by the spread
        const mapping = {
            ...fullMapping,
            'Fecha Fin': fullMapping['Fecha Fin'] || fullMapping['fechaFin'] || '__________',
            'Fecha Final': fullMapping['Fecha Final'] || fullMapping['fechaFin'] || '__________',
            'Fecha Inicio': fullMapping['Fecha Inicio'] || fullMapping['fechaInicio'] || baseMapping['Fecha Inicio'],
            'Ciudad Firma': fullMapping['Ciudad Firma'] || fullMapping['ciudadFirma'] || '__________',
            'Ciudad Notificación': fullMapping['Ciudad Notificación'] || fullMapping['ciudadNotificacion'] || '__________',
            'Valor Honorarios': fullMapping['Valor Honorarios'] || fullMapping['valorHonorarios'] || baseMapping['Valor Honorarios'],
            'Valor Penalidad': fullMapping['Valor Penalidad'] || fullMapping['valorPenalidad'] || baseMapping['Valor Penalidad'],
        };

        Object.keys(mapping).forEach(key => {
            const val = mapping[key];
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            if (val !== undefined && val !== null) {
                live = live.replace(regex, val);
            }
        });
        return live;
    };

    return (
        <div style={{ color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gestión de Contratos</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualice, filtre y gestione sus contratos legales asignados.</p>
                </div>
                <Button onClick={() => setIsSelectionModalOpen(true)}>
                    <Plus size={18} />
                    Crear Nuevo Contrato
                </Button>
            </header>

            <Card style={{ padding: '0' }}>
                {/* Complex Filter Bar */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por Cliente o ID..."
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
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <select
                                value={lawyerFilter}
                                onChange={(e) => setLawyerFilter(e.target.value)}
                                style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">Abogado: Todos</option>
                                {lawyers.map(lawyer => (
                                    <option key={lawyer.id} value={String(lawyer.id)}>{lawyer.nombre} {lawyer.apellido}</option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">Estado: Todos</option>
                                <option value="VENCIDO">Vencido</option>
                                <option value="BORRADOR">Borrador</option>
                                <option value="TERMINADO">Terminado</option>
                            </select>
                            <select style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'white', outline: 'none', cursor: 'pointer' }}>
                                <option>Insolvencia Económica</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contracts Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(30, 45, 69, 0.2)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID Contrato</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cliente</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Fecha</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estado</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.length > 0 ? (
                                filteredContracts.map((contract) => (
                                    <tr key={contract.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-gold)', fontWeight: 600 }}>{contract.id}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                                                    <User size={16} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>
                                                    {contract.cliente ? `${contract.cliente.nombre} ${contract.cliente.apellido || ''}` : 'Sin Cliente'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{contract.tipo || 'N/A'}</span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {contract.fecha}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor:
                                                    contract.estado === 'TERMINADO' ? 'rgba(34, 197, 94, 0.15)' :
                                                        contract.estado === 'BORRADOR' ? 'rgba(245, 158, 11, 0.15)' :
                                                            'rgba(239, 68, 68, 0.15)',
                                                color:
                                                    contract.estado === 'TERMINADO' ? '#22c55e' :
                                                        contract.estado === 'BORRADOR' ? '#f59e0b' :
                                                            '#ef4444',
                                                border: `1px solid ${contract.estado === 'TERMINADO' ? 'rgba(34, 197, 94, 0.3)' :
                                                    contract.estado === 'BORRADOR' ? 'rgba(245, 158, 11, 0.3)' :
                                                        'rgba(239, 68, 68, 0.3)'
                                                    }`
                                            }}>
                                                {contract.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => openPreviewModal(contract)}
                                                    style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1e2d45', borderRadius: '0.375rem', color: '#94a3b8', cursor: 'pointer' }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {contract.estado === 'BORRADOR' && (
                                                    <button
                                                        onClick={() => openEditModal(contract)}
                                                        style={{ padding: '0.5rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '0.375rem', color: 'var(--accent-gold)', cursor: 'pointer' }}
                                                        title="Editar Contrato"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteClick(contract)}
                                                    style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.375rem', color: '#ef4444', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No se encontraron contratos con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Mostrando {filteredContracts.length} contratos</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button style={{ background: 'none', border: '1px solid var(--border-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{'<'}</button>
                        <button style={{ background: 'none', border: '1px solid var(--border-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{'>'}</button>
                    </div>
                </div>
            </Card>

            {/* --- Modals Implementation --- */}

            {/* Edit Modal */}
            {isEditModalOpen && selectedContract && (
                <Modal title="Editar Información de Contrato" onClose={closeModal}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>ID del Contrato</label>
                                <input readOnly value={selectedContract.id} style={{ padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: '#475569', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Estado</label>
                                <select
                                    value={editFormData.estado}
                                    onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                                    style={{ padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                >
                                    <option value="BORRADOR">Borrador</option>
                                    <option value="TERMINADO">Terminado</option>
                                    <option value="VENCIDO">Vencido</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cliente</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    readOnly
                                    value={selectedContract?.cliente ? `${selectedContract.cliente.nombre} ${selectedContract.cliente.apellido || ''}` : ''}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Abogado Asignado</label>
                            <select
                                value={editFormData.abogado_id}
                                onChange={(e) => setEditFormData({ ...editFormData, abogado_id: e.target.value })}
                                style={{ padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                            >
                                <option value="">Seleccionar Abogado</option>
                                {lawyers.map(l => (
                                    <option key={l.id} value={l.id}>{l.nombre} {l.apellido}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="outline" onClick={closeModal} style={{ borderColor: '#1e2d45', color: 'white' }}>Cancelar</Button>
                            <Button onClick={handleSaveEdit} style={{ backgroundColor: '#D4AF37', color: '#0a1423', border: 'none' }}>
                                <Save size={18} />
                                Guardar Cambios
                            </Button>
                        </div>

                        <div style={{ borderTop: '1px solid #1e2d45', marginTop: '1rem', paddingTop: '1rem', textAlign: 'center' }}>
                            <button
                                onClick={() => navigate(`/contracts/register?contractId=${selectedContract.id}`)}
                                style={{ background: 'none', border: 'none', color: '#D4AF37', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Ir al Editor de Cláusulas Avanzado →
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Preview Modal */}
            {isPreviewModalOpen && selectedContract && (
                <Modal title="Vista Previa de Contrato" onClose={closeModal}>
                    {/* Hidden PDF Template for High Quality Export */}
                    <div ref={pdfRef} style={{
                        display: 'none',
                        width: '210mm',
                        padding: '25mm',
                        backgroundColor: 'white',
                        color: 'black',
                        fontFamily: '"Times New Roman", Times, serif',
                        lineHeight: '1.6'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0' }}>LEXCONTRACT</h1>
                            <p style={{ fontSize: '10pt', margin: '5px 0' }}>Soluciones Jurídicas Profesionales</p>
                            <div style={{ width: '100%', height: '2px', backgroundColor: 'black', margin: '15px 0' }}></div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES
                            </h2>
                            <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>No. {selectedContract.id}</p>
                        </div>

                        <p style={{ textAlign: 'justify', fontSize: '11pt', marginBottom: '1.5rem' }}>
                            Entre los suscritos <strong>{selectedContract.abogado ? `${selectedContract.abogado.nombre} ${selectedContract.abogado.apellido}` : (selectedContract.variables_adicionales?.representanteLegal || 'ADMIN LEX')}</strong>, mayor de edad e identificado como representante de <strong>LEXCONTRACT</strong>, quien en adelante se denominará como EL CONTRATISTA, y <strong>{selectedContract?.cliente ? `${selectedContract.cliente.nombre} ${selectedContract.cliente.apellido || ''}` : '____________________'}</strong> identificado con documento No. <strong>{selectedContract?.cliente?.cedula || '__________'}</strong>, quien en adelante se denominará EL CONTRATANTE, han convenido celebrar el presente contrato de prestación de servicios profesionales bajo la modalidad de <strong>{selectedContract.tipo && selectedContract.tipo !== 'plantilla' ? selectedContract.tipo : (selectedContract.variables_adicionales?.areaPractica || 'Insolvencia Económica')}</strong>, que se regulará por las cláusulas que a continuación se expresan:
                        </p>

                        {(selectedContract.clauses && (Array.isArray(selectedContract.clauses) ? selectedContract.clauses : [selectedContract.clauses])).map((clause, idx) => (
                            <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                <p style={{ textAlign: 'justify', fontSize: '11pt' }}>
                                    <strong style={{ textTransform: 'uppercase' }}>
                                        {idx === 0 ? 'PRIMERA. ' : idx === 1 ? 'SEGUNDA. ' : idx === 2 ? 'TERCERA. ' : idx === 3 ? 'CUARTA. ' : idx === 4 ? 'QUINTA. ' : `${idx + 1}ª. `}
                                        {(clause.titulo || clause.title || '').toUpperCase()}:
                                    </strong> {renderPreviewContent(clause.texto || clause.content, selectedContract)}
                                </p>
                            </div>
                        ))}

                        {/* PDF Payments Table */}
                        {selectedContract.variables_adicionales?.installments?.length > 0 ? (
                            <div style={{ marginTop: '2rem', pageBreakInside: 'avoid' }}>
                                <h3 style={{ textTransform: 'uppercase', fontSize: '11pt', fontWeight: 700, marginBottom: '0.8rem', borderBottom: '1px solid black', paddingBottom: '5px' }}>
                                    RESUMEN DE PAGOS Y ABONOS
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '1rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                                            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '15%' }}>Cuota</th>
                                            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Fecha de Vencimiento</th>
                                            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', width: '25%' }}>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedContract.variables_adicionales.installments.map((inst, i) => (
                                            <tr key={i}>
                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '6px' }}>{inst.fecha}</td>
                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>$ {inst.monto}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p style={{ fontSize: '9pt', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                    Monto Total del Contrato: <strong>$ {selectedContract.total}</strong>
                                </p>
                            </div>
                        ) : (
                            <div style={{ marginTop: '2rem', pageBreakInside: 'avoid' }}>
                                <p style={{ fontSize: '10pt', textAlign: 'justify' }}>
                                    <strong>FORMA DE PAGO:</strong> El CONTRATANTE pagará al CONTRATISTA la suma de <strong>$ {selectedContract.total}</strong> en un único pago (PAGO ÚNICO).
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40mm' }}>
                            <div>
                                <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                    <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0' }}>EL CONTRATANTE</p>
                                    <p style={{ fontSize: '9pt', margin: '0' }}>CC/NIT: {selectedContract?.cliente?.cedula || '__________'}</p>
                                </div>
                            </div>
                            <div>
                                <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                    <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0' }}>EL CONTRATISTA</p>
                                    <p style={{ fontSize: '9pt', margin: '0' }}>LEXCONTRACT</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '8pt', color: '#666' }}>
                            <p>Documento generado electrónicamente en {selectedContract.variables_adicionales?.ciudadFirma || 'Bogotá D.C.'} - {selectedContract.fecha}</p>
                            <p>www.lexcontract.com</p>
                        </div>
                    </div>

                    {/* Visible Preview UI */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '3rem',
                        color: 'black',
                        fontFamily: '"Times New Roman", Times, serif',
                        borderRadius: '0.5rem',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                        maxHeight: '60vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 style={{ margin: 0, fontSize: '20pt', fontWeight: 800 }}>LEXCONTRACT</h2>
                            <p style={{ margin: '5px 0', fontSize: '10pt', color: '#666' }}>SOLUCIONES JURÍDICAS Y FINANCIERAS</p>
                            <div style={{ height: '2px', backgroundColor: 'black', margin: '20px auto', width: '100%' }}></div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ textTransform: 'uppercase', fontSize: '14pt', fontWeight: 700 }}>
                                CONTRATO DE PRESTACIÓN DE SERVICIOS
                            </h3>
                            <p style={{ fontSize: '12pt', fontWeight: 700 }}>No. {selectedContract.id}</p>
                        </div>

                        <p style={{ textAlign: 'justify', lineHeight: 1.8, fontSize: '11pt' }}>
                            Entre los suscritos <strong>{selectedContract.abogado ? `${selectedContract.abogado.nombre} ${selectedContract.abogado.apellido}` : (selectedContract.variables_adicionales?.representanteLegal || 'ADMIN LEX')}</strong>, actuando en representación de <strong>LEXCONTRACT</strong>, y el señor(a) <strong>{selectedContract?.cliente ? `${selectedContract.cliente.nombre} ${selectedContract.cliente.apellido || ''}` : '____________________'}</strong>, mayor de edad e identificado con CC. No. <strong>{selectedContract?.cliente?.cedula || '__________'}</strong>, se celebra el presente contrato de consultoría técnica bajo la modalidad de <strong>{selectedContract.tipo && selectedContract.tipo !== 'plantilla' ? selectedContract.tipo : (selectedContract.variables_adicionales?.areaPractica || 'Insolvencia Económica')}</strong>, el cual se regirá por las condiciones expresadas en las cláusulas siguientes:
                        </p>

                        <div style={{ marginTop: '2rem' }}>
                            {selectedContract.clauses && (Array.isArray(selectedContract.clauses) ? selectedContract.clauses : [selectedContract.clauses]).map((clause, idx) => (
                                <div key={idx} style={{ marginBottom: '1rem' }}>
                                    <p style={{ textAlign: 'justify', lineHeight: 1.8, fontSize: '11pt' }}>
                                        <strong>
                                            {idx === 0 ? 'PRIMERA. ' : idx === 1 ? 'SEGUNDA. ' : idx === 2 ? 'TERCERA. ' : idx === 3 ? 'CUARTA. ' : idx === 4 ? 'QUINTA. ' : `${idx + 1}ª. `}
                                            {(clause.titulo || clause.title || '').toUpperCase()}:
                                        </strong> {renderPreviewContent(clause.texto || clause.content, selectedContract)}
                                    </p>
                                </div>
                            ))}

                            {/* UI Payments Table */}
                            {selectedContract.variables_adicionales?.installments?.length > 0 ? (
                                <div style={{
                                    marginTop: '3.5rem',
                                    padding: '1.5rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#1e293b' }}>
                                        <DollarSign size={18} />
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Tabla de Pagos Programados</h4>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b' }}>Cuota #</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b' }}>Vencimiento</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>Monto</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedContract.variables_adicionales.installments.map((inst, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{i + 1}</td>
                                                    <td style={{ padding: '0.75rem' }}>{inst.fecha}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>$ {inst.monto}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '1rem',
                                                            backgroundColor: '#fee2e2',
                                                            color: '#ef4444'
                                                        }}>
                                                            PENDIENTE
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ marginTop: '1.25rem', borderTop: '2px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                        <span>COSTO TOTAL DEL CONTRATO:</span>
                                        <span style={{ color: '#D4AF37' }}>$ {selectedContract.total}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    marginTop: '3.5rem',
                                    padding: '1.5rem',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #dcfce7',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#166534' }}>Modalidad: Pago Único</h4>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>El valor total se cancela en una sola exhibición.</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>TOTAL A PAGAR</span>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>$ {selectedContract.total}</div>
                                    </div>
                                </div>
                            )}
                            {(!selectedContract.clauses || (Array.isArray(selectedContract.clauses) && selectedContract.clauses.length === 0)) && (
                                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No hay cláusulas registradas para este contrato.</p>
                            )}
                        </div>

                        <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid black', width: '200px', margin: '0 auto', paddingTop: '10px' }}>
                                    <strong>EL CONTRATANTE</strong>
                                    <p style={{ fontSize: '9pt', margin: 0 }}>
                                        CC/NIT: {selectedContract?.cliente?.cedula || '__________'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid black', width: '200px', margin: '0 auto', paddingTop: '10px' }}>
                                    <strong>EL CONTRATISTA</strong>
                                    <p style={{ fontSize: '9pt', margin: 0 }}>LEXCONTRACT LEGAL</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '8pt', color: '#999' }}>
                            Generado el {selectedContract.fecha} • www.lexcontract.com
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Button onClick={exportToPDF} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={18} />
                            Descargar Ahora
                        </Button>
                        <Button variant="outline" onClick={closeModal} style={{ borderColor: '#1e2d45', color: 'white' }}>Cerrar</Button>
                    </div>
                </Modal>
            )}
            {/* Selection Modal */}
            {isSelectionModalOpen && (
                <Modal title="Nuevo Contrato: Seleccione Método" onClose={() => setIsSelectionModalOpen(false)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                        <div
                            onClick={() => navigate('/contracts/templates')}
                            style={{
                                padding: '2rem',
                                border: '1px solid #1e2d45',
                                borderRadius: '1rem',
                                background: 'rgba(30, 45, 69, 0.4)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#1e2d45'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={32} />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Desde Plantilla</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Use modelos pre-construidos para mayor velocidad.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/contracts/register')}
                            style={{
                                padding: '2rem',
                                border: '1px solid #1e2d45',
                                borderRadius: '1rem',
                                background: 'rgba(30, 45, 69, 0.4)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#1e2d45'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#60a5fa', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Edit2 size={32} />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Manual</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Escriba el contrato desde cero con total libertad.</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#0f1621',
                        border: '1px solid #324467',
                        borderRadius: '1.25rem',
                        padding: '2.5rem',
                        width: '420px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                    }}>
                        <h2 style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            textAlign: 'left'
                        }}>
                            Confirmar Eliminación
                        </h2>
                        <p style={{
                            color: '#92a4c9',
                            fontSize: '0.9375rem',
                            lineHeight: 1.6,
                            marginBottom: '2rem'
                        }}>
                            ¿Estás seguro de que deseas eliminar el contrato <span style={{ color: '#D4AF37', fontWeight: 600 }}>{contractToDelete?.id}</span> de <span style={{ color: '#D4AF37', fontWeight: 600 }}>{contractToDelete?.cliente?.nombre || 'este cliente'}</span>? Esta acción no se puede deshacer.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem'
                        }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#ef4444',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                }}
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

export default Contracts;
