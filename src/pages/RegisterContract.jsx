import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Calendar,
    ChevronDown,
    DollarSign,
    Upload,
    CloudIcon,
    Save,
    X,
    Briefcase,
    Trash2,
    Plus,
    Edit2,
    Download,
    Library
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const RegisterContract = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pdfRef = useRef(null);

    // Modal state for clauses and saving template
    const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clauseToDelete, setClauseToDelete] = useState(null);
    const [templateToSave, setTemplateToSave] = useState({ nombre: '', tipo: 'Insolvencia' });
    const [message, setMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isVariableCatalogOpen, setIsVariableCatalogOpen] = useState(false);
    const [variableSearchTerm, setVariableSearchTerm] = useState('');

    const [lawyers, setLawyers] = useState([]);
    const [clients, setClients] = useState([]);
    const [libraryClauses, setLibraryClauses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper for notifications
    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Load template, lawyers, clients and library clauses
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [lawyersData, clientsData, clausesData, currentUser] = await Promise.all([
                    api.getAbogados(),
                    api.getClients(),
                    api.getClausulas(),
                    api.get('/users/me')
                ]);
                setLawyers(lawyersData);
                setClients(clientsData);
                setLibraryClauses(clausesData);

                // Auto-set the logged-in user as the responsible lawyer
                if (currentUser) {
                    const fullName = `${currentUser.nombre} ${currentUser.apellido}`.trim();
                    setFormData(prev => ({ ...prev, representanteLegal: fullName }));
                }

                const params = new URLSearchParams(location.search);
                const templateId = params.get('template'); // It's a string like PLT-2026-0001

                if (templateId) {
                    const template = await api.getContract(templateId);
                    if (template) {
                        setFormData(prev => ({
                            ...prev,
                            titulo: template.titulo,
                            tipo: template.variables_adicionales?.areaPractica && template.variables_adicionales.areaPractica !== 'plantilla'
                                ? template.variables_adicionales.areaPractica
                                : (template.tipo !== 'plantilla' ? template.tipo : 'Insolvencia Económica'),
                            areaPractica: template.variables_adicionales?.areaPractica && template.variables_adicionales.areaPractica !== 'plantilla'
                                ? template.variables_adicionales.areaPractica
                                : (template.tipo !== 'plantilla' ? template.tipo : 'Insolvencia Económica')
                        }));

                        // Copy clauses from backend JSONB (Instantiation)
                        // Backend template clauses can be List or Dict.
                        // Based on create_library_item, template clauses is the "clauses" field (List of Dicts)
                        const rawClauses = template.clauses;
                        let instantiatedClauses = [];

                        if (Array.isArray(rawClauses)) {
                            instantiatedClauses = rawClauses.map((c, idx) => ({
                                id: Date.now() + idx + Math.random(),
                                title: c.titulo || `Cláusula ${idx + 1}`,
                                content: c.texto || '',
                                variables: c.variables || [],
                                source: 'template'
                            }));
                        } else if (rawClauses && typeof rawClauses === 'object') {
                            // Single clause case (fallback)
                            instantiatedClauses = [{
                                id: Date.now() + Math.random(),
                                title: rawClauses.titulo || 'Objeto',
                                content: rawClauses.texto || '',
                                variables: rawClauses.variables || [],
                                source: 'template'
                            }];
                        }

                        if (instantiatedClauses.length > 0) {
                            setClauses(instantiatedClauses);
                        }

                        showToast(`Plantilla "${template.titulo}" cargada con éxito`);
                    }
                }

                const clauseId = params.get('clause');
                if (clauseId) {
                    const clauseData = await api.getContract(clauseId);
                    if (clauseData) {
                        // For a single library clause
                        // The backend stores the content in 'clauses' field which is a Dict {titulo, texto}
                        const contentObj = clauseData.clauses || {};

                        setClauses([{
                            id: Date.now(),
                            title: contentObj.titulo || clauseData.titulo || 'Cláusula Importada',
                            content: contentObj.texto || '',
                            variables: contentObj.variables || [],
                            source: 'library'
                        }]);

                        showToast(`Cláusula "${clauseData.titulo}" cargada con éxito`);
                    }
                }

                const contractId = params.get('contractId');
                if (contractId) {
                    const contract = await api.getContract(contractId);
                    if (contract) {
                        setFormData(prev => ({
                            ...prev,
                            id: contract.id,
                            titulo: contract.titulo || '',
                            tipo: contract.tipo || 'Insolvencia Económica',
                            detalles: '', // Not in schema, keeping default
                            costoTotal: contract.total ? String(contract.total) : '0.00',
                            cliente: contract.cliente ? `${contract.cliente.nombre} ${contract.cliente.apellido}` : '',
                            dniCliente: contract.cliente?.cedula || '',
                            representanteLegal: contract.abogado ? `${contract.abogado.nombre} ${contract.abogado.apellido}` : prev.representanteLegal
                        }));

                        if (contract.clauses) {
                            // Clauses can be array or object (JSONB)
                            let loadedClauses = [];
                            if (Array.isArray(contract.clauses)) {
                                loadedClauses = contract.clauses;
                            } else if (typeof contract.clauses === 'object') {
                                loadedClauses = [contract.clauses];
                            }
                            // Ensure they have required frontend fields and map backend naming (titulo/texto) to frontend (title/content)
                            setClauses(loadedClauses.map((c, i) => ({
                                ...c,
                                id: c.id || Date.now() + i,
                                title: c.title || c.titulo || `Cláusula ${i + 1}`,
                                content: c.content || c.texto || '',
                                variables: c.variables || [],
                                source: c.source || 'manual'
                            })));
                        }

                        if (contract.variables_adicionales) {
                            setFormData(prev => ({
                                ...prev,
                                ...contract.variables_adicionales,
                                // Ensure standard fields are also set if they exist in variables
                                fechaInicio: contract.variables_adicionales.fechaInicio || prev.fechaInicio,
                                fechaFin: contract.variables_adicionales.fechaFin || prev.fechaFin,
                                ciudadFirma: contract.variables_adicionales.ciudadFirma || prev.ciudadFirma,
                                ciudadNotificacion: contract.variables_adicionales.ciudadNotificacion || prev.ciudadNotificacion,
                                valorHonorarios: contract.variables_adicionales.valorHonorarios || prev.valorHonorarios,
                                valorPenalidad: contract.variables_adicionales.valorPenalidad || prev.valorPenalidad,
                            }));

                            // Set modality if present
                            const mod = contract.variables_adicionales.modalidadPago;
                            if (mod === 'unico' || mod === 'Pago Único') {
                                setPaymentOption('unico');
                            } else if (mod === 'abonos' || mod === 'Abonos') {
                                setPaymentOption('abonos');
                            }

                            // Restore installments (abonos) if they were saved
                            if (contract.variables_adicionales.installments && contract.variables_adicionales.installments.length > 0) {
                                setInstallments(contract.variables_adicionales.installments);
                            }
                        }

                        showToast(`Contrato ${contract.id} cargado para edición`);
                    }
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setMessage({ type: 'error', text: 'Error al cargar datos necesarios.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [location]);

    const [formData, setFormData] = useState({
        titulo: '',
        cliente: '',
        tipo: 'Insolvencia Económica',
        fechaInicio: '',
        fechaFin: '',
        detalles: '',
        costoTotal: '0.00',
        areaPractica: 'Insolvencia Económica',
        valorHonorarios: '0.00',
        modalidadPago: 'unico',
        valorPenalidad: '0.00',
        representanteLegal: 'ADMIN LEX',
        ciudadFirma: 'Bogotá D.C.',
        ciudadNotificacion: 'Bogotá D.C.',
        dniCliente: ''
    });

    const [paymentOption, setPaymentOption] = useState('unico');
    const [installments, setInstallments] = useState([
        { id: Date.now(), fecha: '', monto: '0.00' }
    ]);

    const [clauses, setClauses] = useState([]);

    // Ref for tracking the active textarea and cursor position
    const activeTextareaRef = useRef(null);
    const [activeClauseId, setActiveClauseId] = useState(null);
    const [focusedVar, setFocusedVar] = useState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addInstallment = () => {
        setInstallments([...installments, { id: Date.now(), fecha: '', monto: '0.00' }]);
    };

    const removeInstallment = (id) => {
        setInstallments(installments.filter(inst => inst.id !== id));
    };

    const updateInstallment = (id, field, value) => {
        setInstallments(installments.map(inst => inst.id === id ? { ...inst, [field]: value } : inst));
    };

    const addClause = () => {
        const newId = clauses.length > 0 ? Math.max(...clauses.map(c => c.id)) + 1 : 1;
        setClauses([...clauses, {
            id: newId,
            title: `CLÁUSULA NUEVA ${newId}`,
            content: '',
            variables: ['Nombre Cliente', 'Área de Práctica', 'Fecha Inicio'],
            source: 'manual'
        }]);
    };

    const handleDeleteClick = (clause) => {
        setClauseToDelete(clause);
        setShowDeleteModal(true);
    };

    const confirmDeleteClause = () => {
        setClauses(clauses.filter(c => c.id !== clauseToDelete.id));
        setShowDeleteModal(false);
        setClauseToDelete(null);
        showToast('Cláusula eliminada correctamente');
    };

    const updateClauseContent = (id, newContent) => {
        setClauses(clauses.map(c => c.id === id ? { ...c, content: newContent } : c));
    };

    const updateClauseTitle = (id, newTitle) => {
        setClauses(clauses.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    // Helper to insert variable at cursor
    const insertVariable = (clauseId, variableName) => {
        const clause = clauses.find(c => c.id === clauseId);
        if (!clause) return;

        // Sync metadata: add to variables array if not present
        if (!clause.variables.includes(variableName)) {
            setClauses(clauses.map(c =>
                c.id === clauseId ? { ...c, variables: [...c.variables, variableName] } : c
            ));
        }

        if (!activeTextareaRef.current || activeClauseId !== clauseId) return;

        const textarea = activeTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = clause.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = `${before}[${variableName}]${after}`;

        updateClauseContent(clauseId, newText);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + variableName.length + 2;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleCatalogVariableSelect = (variableName) => {
        if (activeClauseId) {
            insertVariable(activeClauseId, variableName);
            setIsVariableCatalogOpen(false);
            setVariableSearchTerm('');
        }
    };

    // Helper to replace placeholders with live values
    const renderLiveContent = (content) => {
        if (!content) return '';
        let live = content;
        // Merge standard fields with any existing formData fields
        const mapping = {
            'Nombre Cliente': formData.cliente,
            'DNI Cliente': formData.dniCliente,
            'Área de Práctica': formData.areaPractica,
            'Representante Legal': formData.representanteLegal,
            'Ciudad Firma': formData.ciudadFirma,
            'Valor Honorarios': formData.valorHonorarios,
            'Modalidad Pago': paymentOption === 'unico' ? 'Pago Único' : 'Abonos',
            'Valor Penalidad': formData.valorPenalidad,
            'Fecha Inicio': formData.fechaInicio,
            'Fecha Fin': formData.fechaFin,
            'Ciudad Notificación': formData.ciudadNotificacion,
            // Include everything in formData to support dynamic fields
            ...formData
        };

        Object.keys(mapping).forEach(key => {
            const val = mapping[key];
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            if (val && val !== '0.00' && val !== '') {
                live = live.replace(regex, val);
            }
        });
        return live;
    };

    const getFormVariables = () => {
        const foundVars = new Set();
        clauses.forEach(c => {
            const regex = /\[(.*?)\]/g;
            let match;
            while ((match = regex.exec(c.content)) !== null) {
                foundVars.add(match[1]);
            }
        });
        return Array.from(foundVars);
    };

    const globalVariablesCatalog = [
        { name: 'Nombre Cliente', category: 'Partes', description: 'Nombre completo del cliente' },
        { name: 'DNI Cliente', category: 'Partes', description: 'Documento de identidad del cliente' },
        { name: 'Representante Legal', category: 'Partes', description: 'Nombre del abogado responsable' },
        { name: 'Área de Práctica', category: 'Contrato', description: 'Área de práctica legal' },
        { name: 'Valor Honorarios', category: 'Financiero', description: 'Monto total de honorarios' },
        { name: 'Modalidad Pago', category: 'Financiero', description: 'Forma de pago acordada' },
        { name: 'Valor Penalidad', category: 'Financiero', description: 'Valor de penalidad por incumplimiento' },
        { name: 'Fecha Inicio', category: 'Fechas', description: 'Fecha de inicio del contrato' },
        { name: 'Fecha Fin', category: 'Fechas', description: 'Fecha de finalización del contrato' },
        { name: 'Ciudad Firma', category: 'Ubicación', description: 'Ciudad donde se firma el contrato' },
        { name: 'Ciudad Notificación', category: 'Ubicación', description: 'Ciudad para notificaciones judiciales' },
    ];

    const standardFields = [
        'Nombre Cliente', 'DNI Cliente', 'Área de Práctica', 'Representante Legal',
        'Ciudad Firma', 'Valor Honorarios', 'Modalidad Pago', 'Valor Penalidad',
        'Fecha Inicio', 'Fecha Fin', 'Ciudad Notificación'
    ];

    const allDetectedVars = getFormVariables();
    const extraVars = allDetectedVars.filter(v => !standardFields.includes(v));

    const getMissingVariables = () => {
        const mapping = {
            'Nombre Cliente': formData.cliente,
            'DNI Cliente': formData.dniCliente,
            'Área de Práctica': formData.areaPractica,
            'Representante Legal': formData.representanteLegal,
            'Ciudad Firma': formData.ciudadFirma,
            'Valor Honorarios': formData.valorHonorarios,
            'Valor Penalidad': formData.valorPenalidad,
            'Fecha Inicio': formData.fechaInicio,
            'Fecha Fin': formData.fechaFin,
            'Ciudad Notificación': formData.ciudadNotificacion,
            ...formData
        };

        return allDetectedVars.filter(v =>
            (v !== 'Modalidad Pago' && (mapping[v] === undefined || mapping[v] === '' || mapping[v] === '0.00')) || v === focusedVar
        );
    };

    const missingVars = getMissingVariables();

    const exportToPDF = async () => {
        const element = pdfRef.current;
        if (!element) return;

        // Make it visible temporarily for rendering
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
            pdf.save(`Contrato_${formData.cliente.replace(/\s+/g, '_') || 'Nuevo'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            element.style.display = 'none';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setMessage(null);

            // Find selected client and lawyer IDs
            const selectedClient = clients.find(c => `${c.nombre} ${c.apellido}`.trim() === formData.cliente.trim() || c.cedula === formData.dniCliente);
            const selectedLawyer = lawyers.find(l => `${l.nombre} ${l.apellido}`.trim() === formData.representanteLegal.trim());

            if (!selectedClient) throw new Error('Cliente no seleccionado o no válido.');
            if (!selectedLawyer) throw new Error('Abogado responsable no seleccionado.');

            const contractPayload = {
                titulo: formData.titulo,
                cliente_id: selectedClient.id,
                abogado_id: selectedLawyer.id,
                estado: 'BORRADOR',
                tipo: formData.tipo,
                total: parseFloat(formData.costoTotal),
                clauses: clauses.map(c => ({
                    titulo: c.title,
                    texto: c.content,
                    variables: c.variables
                })),
                variables_adicionales: {
                    ...formData,
                    installments: paymentOption === 'abonos' ? installments : []
                }
            };

            if (formData.id) {
                await api.put(`/contracts/${formData.id}`, contractPayload);
                showToast('Contrato actualizado y guardado exitosamente.');
            } else {
                await api.post('/contracts/', contractPayload);
                setMessage({ type: 'success', text: 'Contrato guardado y generado exitosamente.' });
            }
            setTimeout(() => navigate('/contracts'), 2000);
        } catch (err) {
            console.error('Error saving contract:', err);
            setMessage({ type: 'error', text: err.message || 'Error al guardar el contrato.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAsTemplate = async () => {
        try {
            if (!templateToSave.nombre) throw new Error('Por favor ingrese un nombre para la plantilla.');

            setIsSaving(true);
            const templateData = {
                titulo: templateToSave.nombre,
                tipo: formData.tipo || templateToSave.tipo,
                clauses: clauses.map(c => ({
                    titulo: c.title,
                    texto: c.content,
                    variables: c.variables
                }))
            };

            await api.createPlantilla(templateData);
            setIsSaveTemplateModalOpen(false);
            showToast(`Plantilla "${templateToSave.nombre}" guardada con éxito`);
        } catch (err) {
            console.error('Error saving template:', err);
            setMessage({ type: 'error', text: err.message || 'Error al guardar la plantilla.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClientChange = (e) => {
        const value = e.target.value;
        const selected = clients.find(c => `${c.nombre} ${c.apellido}`.trim() === value.trim() || c.cedula === value);
        if (selected) {
            setFormData(prev => ({
                ...prev,
                cliente: `${selected.nombre} ${selected.apellido}`,
                dniCliente: selected.cedula || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, cliente: value }));
        }
    };

    return (
        <div style={{ color: 'white', position: 'relative', paddingBottom: '4rem' }}>
            {/* Hidden PDF Template */}
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
                    <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>No. 2026-{Math.floor(Math.random() * 1000)}</p>
                </div>

                <p style={{ textAlign: 'justify', fontSize: '11pt', marginBottom: '1.5rem' }}>
                    Entre los suscritos <strong>{formData.representanteLegal}</strong>, mayor de edad e identificado como representante de <strong>LEXCONTRACT</strong>, quien en adelante se denominará como EL CONTRATISTA, y <strong>{formData.cliente || '____________________'}</strong> identificado con documento No. <strong>{formData.dniCliente || '__________'}</strong>, quien en adelante se denominará EL CONTRATANTE, han convenido celebrar el presente contrato de prestación de servicios profesionales que se regulará por las cláusulas que a continuación se expresan:
                </p>

                {clauses.map((clause, idx) => (
                    <div key={clause.id} style={{ marginBottom: '1.5rem' }}>
                        <p style={{ textAlign: 'justify', fontSize: '11pt' }}>
                            <strong style={{ textTransform: 'uppercase' }}>
                                {idx === 0 ? 'PRIMERA. ' : idx === 1 ? 'SEGUNDA. ' : idx === 2 ? 'TERCERA. ' : 'CUARTA. '}
                                {clause.title}:
                            </strong> {renderLiveContent(clause.content)}
                        </p>
                    </div>
                ))}

                <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40mm' }}>
                    <div>
                        <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                            <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0' }}>EL CONTRATANTE</p>
                            <p style={{ fontSize: '9pt', margin: '0' }}>CC/NIT: {formData.dniCliente || '__________'}</p>
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
                    <p>Documento generado electrónicamente en {formData.ciudadFirma} - {new Date().toLocaleDateString()}</p>
                    <p>www.lexcontract.com</p>
                </div>
            </div>

            {/* UI Content */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#92a4c9'
            }}>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Inicio</span>
                <span>›</span>
                <span onClick={() => navigate('/contracts')} style={{ cursor: 'pointer' }}>Contratos</span>
                <span>›</span>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>Crear Nuevo</span>
            </div>

            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
                    Crear Nuevo Contrato
                </h1>
                <p style={{ color: '#92a4c9', fontSize: '1rem' }}>
                    Complete los detalles para la generación del nuevo acuerdo jurídico.
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px' }}>

                <Card style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #0d1a2d 0%, #101e36 100%)',
                    border: '1px solid #1e2d45'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        color: '#D4AF37',
                        fontSize: '1rem',
                        fontWeight: 700
                    }}>
                        <Briefcase size={20} />
                        Información General
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Título del Contrato <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="titulo"
                                required
                                value={formData.titulo}
                                onChange={handleFormChange}
                                placeholder="Ej: Contrato de Arrendamiento, Oficina Central"
                                style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9375rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Cliente <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#475569'
                                }} />
                                <input
                                    type="text"
                                    name="cliente"
                                    required
                                    value={formData.cliente}
                                    onChange={handleClientChange}
                                    placeholder="Buscar cliente..."
                                    list="clients-list"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.9375rem'
                                    }}
                                />
                                <datalist id="clients-list">
                                    {clients.map(c => (
                                        <option key={c.id} value={`${c.nombre} ${c.apellido}`} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Abogado Responsable <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="representanteLegal"
                                required
                                value={formData.representanteLegal}
                                readOnly
                                style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: '#D4AF37',
                                    outline: 'none',
                                    fontSize: '0.9375rem',
                                    cursor: 'default'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Identificación (DNI/CC) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="dniCliente"
                                required
                                value={formData.dniCliente}
                                onChange={handleFormChange}
                                placeholder="Ej: 1.090.XXX.XXX"
                                readOnly
                                style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: '#94a3b8',
                                    outline: 'none',
                                    fontSize: '0.9375rem',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Tipo de Contrato <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleFormChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9375rem'
                                    }}
                                >
                                    <option value="Insolvencia Económica">Insolvencia Económica</option>
                                </select>
                                <ChevronDown size={20} style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Área de Práctica <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="areaPractica"
                                required
                                value={formData.areaPractica}
                                onChange={handleFormChange}
                                placeholder="Ej: Derecho Civil, Comercial..."
                                style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9375rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Vigencia: Fecha Inicio <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="fechaInicio"
                                required
                                value={formData.fechaInicio}
                                onChange={handleFormChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #0d1a2d 0%, #101e36 100%)',
                    border: '1px solid #1e2d45'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        color: '#D4AF37',
                        fontSize: '1rem',
                        fontWeight: 700
                    }}>
                        <DollarSign size={20} />
                        Información de Costos y Pagos
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Costo Total del Proceso (COP)
                            </label>
                            <input
                                type="text"
                                name="costoTotal"
                                value={formData.costoTotal}
                                onChange={handleFormChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a1423',
                                    border: '1px solid #1e2d45',
                                    borderRadius: '0.5rem',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                Opción de Pago
                            </label>
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <div
                                        onClick={() => {
                                            setPaymentOption('unico');
                                            setFormData(prev => ({ ...prev, modalidadPago: 'unico' }));
                                        }}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: `2px solid ${paymentOption === 'unico' ? '#D4AF37' : '#475569'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {paymentOption === 'unico' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />}
                                    </div>
                                    <span style={{ fontSize: '0.9375rem', color: paymentOption === 'unico' ? 'white' : '#94a3b8' }}>Pago Único</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <div
                                        onClick={() => {
                                            setPaymentOption('abonos');
                                            setFormData(prev => ({ ...prev, modalidadPago: 'abonos' }));
                                        }}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: `2px solid ${paymentOption === 'abonos' ? '#D4AF37' : '#475569'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {paymentOption === 'abonos' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />}
                                    </div>
                                    <span style={{ fontSize: '0.9375rem', color: paymentOption === 'abonos' ? 'white' : '#94a3b8' }}>Abonos</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {paymentOption === 'abonos' && (
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid #1e2d45',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Desglose de Abonos / Cuotas</h4>
                                <Button
                                    type="button"
                                    onClick={addInstallment}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.75rem',
                                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                        color: '#D4AF37',
                                        border: '1px solid #D4AF37'
                                    }}
                                >
                                    <Plus size={14} /> Añadir Cuota
                                </Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {installments.map((inst, index) => (
                                    <div key={inst.id} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '40px 1fr 1fr 40px',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        backgroundColor: '#0a1423',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #1e2d45'
                                    }}>
                                        <div style={{ color: '#D4AF37', fontWeight: 800 }}>{index + 1}.</div>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                            <input
                                                type="date"
                                                value={inst.fecha}
                                                onChange={(e) => updateInstallment(inst.id, 'fecha', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #1e2d45',
                                                    borderRadius: '0.375rem',
                                                    color: 'white',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                            <input
                                                type="text"
                                                value={inst.monto}
                                                onChange={(e) => updateInstallment(inst.id, 'monto', e.target.value)}
                                                placeholder="0.00"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #1e2d45',
                                                    borderRadius: '0.375rem',
                                                    color: 'white',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeInstallment(inst.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Missing Data Validation Alert */}
                {missingVars.length > 0 && (
                    <Card style={{
                        padding: '1.5rem 2rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                            <X size={20} />
                            Faltan datos en el formulario para completar las variables
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                            Los campos listados a continuación se encuentran en las secciones de <strong>Información del Cliente</strong>, <strong>Detalles del Contrato</strong> o <strong>Costos y Pagos</strong> superiores:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {missingVars.map(v => (
                                <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '0.25rem' }}>{v}</label>
                                    <input
                                        type="text"
                                        name={v}
                                        value={formData[v] || ''}
                                        onChange={handleFormChange}
                                        placeholder={`Ingrese valor para ${v}...`}
                                        style={{
                                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '0.5rem',
                                            padding: '0.6rem 0.8rem',
                                            color: '#fca5a5',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                                            setFocusedVar(v);
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                                            setFocusedVar(null);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Dynamic Additional Fields Section */}
                {extraVars.length > 0 && (
                    <Card style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #0d1a2d 0%, #101e36 100%)',
                        border: '1px solid #1e2d45',
                        marginTop: '2rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            color: '#22c55e',
                            fontSize: '1rem',
                            fontWeight: 700
                        }}>
                            <Plus size={20} />
                            Campos Adicionales del Contrato
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            A continuación se listan campos detectados en las cláusulas que requieren información adicional:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {extraVars.map(v => (
                                <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                                        {v} <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name={v}
                                        value={formData[v] || ''}
                                        onChange={handleFormChange}
                                        placeholder={`Escriba ${v.toLowerCase()}...`}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            backgroundColor: '#0a1423',
                                            border: '1px solid #1e2d45',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.9375rem'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Clause Editor */}
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Editor de Cláusulas Personalizado</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Gestione los bloques legales del documento.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="outline" type="button" onClick={exportToPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#60a5fa', borderColor: '#2563eb' }}>
                                <Download size={18} />
                                Exportar a PDF
                            </Button>
                            <Button type="button" onClick={() => setIsSaveTemplateModalOpen(true)} style={{ backgroundColor: '#D4AF37', color: '#0a1423', border: 'none', fontWeight: 700 }}>
                                <Save size={18} />
                                Guardar como Plantilla
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {clauses.map((clause, idx) => (
                            <div key={clause.id} style={{
                                background: 'linear-gradient(135deg, #0d1a2d 0%, #101e36 100%)',
                                borderRadius: '1rem',
                                border: '1px solid #1e2d45'
                            }}>
                                <div style={{
                                    padding: '1.25rem 2rem',
                                    backgroundColor: 'rgba(30, 45, 69, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #1e2d45'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{
                                            backgroundColor: clause.source === 'template' ? 'rgba(34, 197, 94, 0.1)' : clause.source === 'library' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                            color: clause.source === 'template' ? '#22c55e' : clause.source === 'library' ? '#60a5fa' : '#D4AF37',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {clause.source === 'template' ? 'PLANTILLA' : clause.source === 'library' ? 'BIBLIOTECA' : 'MANUAL'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: '#D4AF37', fontWeight: 600, fontSize: '1.125rem' }}>Cláusula {idx + 1}:</span>
                                            {clause.source === 'manual' ? (
                                                <input
                                                    type="text"
                                                    value={clause.title}
                                                    onChange={(e) => updateClauseTitle(clause.id, e.target.value)}
                                                    style={{
                                                        backgroundColor: 'rgba(10, 20, 35, 0.5)',
                                                        border: '1px solid #1e2d45',
                                                        borderRadius: '0.375rem',
                                                        color: 'white',
                                                        fontSize: '1.125rem',
                                                        fontWeight: 700,
                                                        padding: '0.3rem 0.6rem',
                                                        width: '100%',
                                                        minWidth: '300px',
                                                        outline: 'none'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{clause.title}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button type="button" onClick={() => handleDeleteClick(clause)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <textarea
                                        value={clause.content}
                                        onChange={(e) => updateClauseContent(clause.id, e.target.value)}
                                        onFocus={() => {
                                            activeTextareaRef.current = document.activeElement;
                                            setActiveClauseId(clause.id);
                                        }}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            backgroundColor: '#0a1423',
                                            border: '1px solid #1e2d45',
                                            borderRadius: '0.75rem',
                                            color: '#cbd5e1',
                                            padding: '1.5rem',
                                            fontSize: '1rem',
                                            lineHeight: 1.6,
                                            outline: 'none'
                                        }}
                                    />

                                    <div style={{
                                        padding: '1.5rem',
                                        backgroundColor: 'rgba(10, 20, 35, 0.3)',
                                        borderRadius: '0.75rem',
                                        border: '1px dashed #1e2d45',
                                        marginTop: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>VISTA PREVIA</span>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                                            {renderLiveContent(clause.content)}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {clause.variables.map(v => {
                                            // Find if this variable is in the original template/clause content
                                            // (Simplifying suggested variables for real data)
                                            const isSuggested = clause.content.includes(`[${v}]`);

                                            return (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => insertVariable(clause.id, v)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: isSuggested ? 'rgba(37, 99, 235, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                        border: `1px solid ${isSuggested ? 'rgba(37, 99, 235, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                                                        borderRadius: '0.5rem',
                                                        color: isSuggested ? '#60a5fa' : '#22c55e',
                                                        fontSize: '0.8125rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem'
                                                    }}
                                                >
                                                    [{v}]
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveClauseId(clause.id);
                                                setIsVariableCatalogOpen(true);
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: 'rgba(71, 85, 105, 0.2)',
                                                border: '1px solid rgba(71, 85, 105, 0.4)',
                                                borderRadius: '0.5rem',
                                                color: '#94a3b8',
                                                fontSize: '0.8125rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Plus size={14} /> Variables
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Button
                                type="button"
                                onClick={addClause}
                                style={{
                                    padding: '3rem',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    border: '2px dashed #1e2d45',
                                    borderRadius: '1rem',
                                    color: '#475569',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                <Plus size={32} />
                                <span style={{ fontWeight: 700 }}>Añadir Nueva Cláusula</span>
                            </Button>

                            <button
                                type="button"
                                onClick={() => setIsClauseModalOpen(true)}
                                style={{
                                    padding: '3rem',
                                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                                    border: '2px dashed rgba(212, 175, 55, 0.3)',
                                    borderRadius: '1rem',
                                    color: '#D4AF37',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                <Library size={32} />
                                <span style={{ fontWeight: 700 }}>Insertar Cláusula Reservada</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    marginTop: '2rem',
                    paddingBottom: '2rem'
                }}>
                    <Button onClick={() => navigate('/contracts')} variant="outline" style={{ padding: '0.75rem 2.5rem', color: 'white', borderColor: '#1e2d45' }}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={exportToPDF} style={{ padding: '0.75rem 2.5rem', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                        <Download size={20} />
                        Exportar a PDF
                    </Button>
                    <Button type="submit" style={{ padding: '0.75rem 2.5rem', backgroundColor: '#D4AF37', color: '#0a1423', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                        <Save size={20} />
                        Guardar Contrato
                    </Button>
                </div>
            </form>

            {/* Clause Selection Modal */}
            {isClauseModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <Card style={{
                        width: '100%',
                        maxWidth: '700px',
                        height: '80vh',
                        padding: '0',
                        overflow: 'hidden',
                        border: '1px solid #1e2d45',
                        background: '#0d1a2d',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '1.25rem 2rem',
                            borderBottom: '1px solid #1e2d45',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(30, 45, 69, 0.3)',
                            flexShrink: 0
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Repositorio de Cláusulas</h3>
                            <button onClick={() => setIsClauseModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            {libraryClauses.map(repo => (
                                <div
                                    key={repo.id}
                                    onClick={() => {
                                        const newId = Date.now() + Math.random();
                                        setClauses([...clauses, {
                                            id: newId,
                                            title: repo.titulo,
                                            content: repo.clauses?.texto || '',
                                            variables: repo.clauses?.variables || [],
                                            source: 'library'
                                        }]);
                                        setIsClauseModalOpen(false);
                                        showToast(`Cláusula "${repo.titulo}" insertada`);
                                    }}
                                    style={{
                                        padding: '1.5rem',
                                        backgroundColor: '#0a1423',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #1e2d45',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#1e2d45'; }}
                                >
                                    <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>{repo.titulo}</h5>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                        {repo.clauses?.texto?.substring(0, 150)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Save as Template Modal */}
            {isSaveTemplateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ width: '400px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Guardar como Plantilla</h2>
                            <button onClick={() => setIsSaveTemplateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nombre de la Plantilla</label>
                                <input
                                    type="text"
                                    value={templateToSave.nombre}
                                    onChange={(e) => setTemplateToSave({ ...templateToSave, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0a1423', border: '1px solid #1e2d45', borderRadius: '0.5rem', color: 'white' }}
                                    placeholder="Ej: Contrato de Arrendamiento VIP"
                                />
                            </div>
                            <Button onClick={handleSaveAsTemplate} style={{ backgroundColor: '#D4AF37', color: '#000', marginTop: '1rem' }}>
                                <Save size={18} />
                                Confirmar y Guardar
                            </Button>
                        </div>
                    </Card>
                </div>
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
                            ¿Estás seguro de que deseas eliminar la cláusula <span style={{ color: '#D4AF37', fontWeight: 600 }}>{clauseToDelete?.title}</span>? Esta acción no se puede deshacer.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem'
                        }}>
                            <button
                                type="button"
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
                                type="button"
                                onClick={confirmDeleteClause}
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

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    backgroundColor: '#1e2d45',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #D4AF37',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <Save size={18} style={{ color: '#D4AF37' }} />
                    {notification}
                </div>
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            {/* Global Variable Catalog Modal */}
            <datalist id="lawyers-list">
                {lawyers.map(l => (
                    <option key={l.id} value={`${l.nombre} ${l.apellido}`} />
                ))}
            </datalist>
            {isVariableCatalogOpen && (
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
                    zIndex: 3000,
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: '#0d1a2d',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        borderRadius: '1.25rem',
                        border: '1px solid #1e2d45',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid #1e2d45',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(30, 45, 69, 0.3)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#D4AF37' }}>Catálogo de Variables</h3>
                            <button onClick={() => setIsVariableCatalogOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e2d45' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar variable..."
                                    value={variableSearchTerm}
                                    onChange={(e) => setVariableSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                                        backgroundColor: '#0a1423',
                                        border: '1px solid #1e2d45',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {globalVariablesCatalog
                                .filter(v => v.name.toLowerCase().includes(variableSearchTerm.toLowerCase()) || v.category.toLowerCase().includes(variableSearchTerm.toLowerCase()))
                                .map(v => (
                                    <div
                                        key={v.name}
                                        onClick={() => handleCatalogVariableSelect(v.name)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: 'rgba(30, 45, 69, 0.4)',
                                            border: '1px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = 'rgba(30, 45, 69, 0.4)'; }}
                                    >
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>{v.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{v.description}</div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.625rem',
                                            fontWeight: 800,
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                            color: '#60a5fa',
                                            borderRadius: '0.25rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {v.category}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterContract;
