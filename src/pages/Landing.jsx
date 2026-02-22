import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, Users, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div style={{ color: 'white', width: '100%' }}>
            {/* Hero Section */}
            <section style={{
                padding: '120px 4rem 100px 4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ flex: 1.2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        color: 'var(--accent-gold)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginBottom: '2rem',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                        <Shield size={14} />
                        PORTAL CORPORATIVO INTERNO
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
                        Unidos por la <span style={{ color: 'var(--accent-gold)' }}>Justicia</span>, Guiados por la <span style={{ color: 'var(--accent-gold)' }}>Excelencia</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '540px' }}>
                        Bienvenido a la plataforma central de LexContract. Gestione expedientes, acceda a recursos legales y coordine procesos internos con los más altos estándares de seguridad y eficiencia.
                    </p>
                    <Button onClick={() => navigate('/dashboard')} style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                        Acceder al Sistema
                        <ArrowRight size={20} />
                    </Button>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '1.5rem',
                        aspectRatio: '4/3',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ height: '20px', width: '60%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '4rem' }}></div>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1, height: '140px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}></div>
                                <div style={{ flex: 1, height: '140px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '1rem', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                                    <div style={{ width: '100%', height: '40px', background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)', opacity: 0.3 }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Element */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '-20px',
                        backgroundColor: '#1a2538',
                        padding: '1.25rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', color: '#22c55e' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expedientes Activos</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>458</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section style={{ padding: '100px 4rem', backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Nuestros Valores Institucionales</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem', maxWidth: '500px' }}>Pilares fundamentales que guían el trabajo diario de cada miembro del equipo LexContract.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {[
                            { title: 'Integridad', icon: Shield, desc: 'Actuamos con honestidad y transparencia en cada procedimiento, manteniendo la confianza como nuestro activo más valioso.' },
                            { title: 'Colaboración', icon: Users, desc: 'Fomentamos un entorno donde el conocimiento se comparte y el éxito del equipo está por encima del éxito individual.' },
                            { title: 'Excelencia', icon: Target, desc: 'Buscamos la perfección jurídica y operativa, superando constantemente las expectativas en la resolución de casos.' }
                        ].map((val, i) => (
                            <Card key={i} style={{ padding: '2.5rem' }}>
                                <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
                                    <val.icon size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{val.title}</h3>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{val.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Support CTA Section */}
            <section style={{
                padding: '100px 4rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-sidebar)' // Color saturado solicitado
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>¿Necesita Asistencia Técnica?</h2>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                        Si experimenta problemas de acceso o con el uso de las herramientas internas, contacte inmediatamente al equipo de soporte.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/support')} style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
                        Contactar Soporte TI
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#0a0e14' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr)', gap: '4rem', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-gold)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'black', fontWeight: 900, fontSize: '1rem' }}>L</span>
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>LexContract</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>Portal interno de gestión y productividad legal. Herramienta de uso exclusivo para empleados.</p>
                        </div>
                        {[
                            { title: 'Accesos Rápidos', links: ['Dashboard', 'Mis Casos'] },
                            { title: 'Firma', links: ['Sobre Nosotros'] },
                            { title: 'Ayuda', links: ['Soporte Técnico'] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' }}>{col.title}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {col.links.map((link, j) => (
                                        <li key={j}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <p>© 2024 LexContract. Uso interno confidencial.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
