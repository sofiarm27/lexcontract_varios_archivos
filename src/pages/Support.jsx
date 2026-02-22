import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Clock, HelpCircle, FileText, ArrowLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Support = () => {
    const navigate = useNavigate();

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Soporte Técnico Institucional</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px' }}>
                    Centro de asistencia externa para LexContract. Contacte con nuestro equipo especializado a través de los canales oficiales.
                </p>
            </div>

            <Card style={{ display: 'flex', padding: '0', maxWidth: '800px', width: '100%', overflow: 'hidden' }}>
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem',
                    position: 'relative'
                }}>
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <HelpCircle size={32} color="white" />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.6 }}>AYUDA TI</span>
                    </div>
                    {/* Decorative element */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }}></div>
                </div>

                <div style={{ flex: '1.5', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Canales Oficiales de Contacto</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Información de contacto exclusiva para atención de requerimientos técnicos.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Phone size={20} color="var(--accent-blue)" style={{ marginTop: '0.25rem' }} />
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Extensiones Internas</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>101, 102, 105 (Nivel 1)</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Mail size={20} color="var(--accent-blue)" style={{ marginTop: '0.25rem' }} />
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Correo Electrónico</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>soporte@lexcontract.com</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Clock size={20} color="var(--accent-blue)" style={{ marginTop: '0.25rem' }} />
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Horario de Atención</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>Lunes a Viernes, 08:00 - 18:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <footer style={{ marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                © 2024 LEXCONTRACT S.C. — DEPARTAMENTO DE SISTEMAS & TI
            </footer>
        </div>
    );
};

export default Support;
