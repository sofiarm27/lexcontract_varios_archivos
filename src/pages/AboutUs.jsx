import React from 'react';
import { Target, Compass, Scale, Users } from 'lucide-react';
import Card from '../components/Card';

const AboutUs = () => {
    const teamMembers = [
        {
            name: 'Dr. Alejandro Vance',
            role: 'SOCIO PRINCIPAL',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
        },
        {
            name: 'Dra. Elena Sterling',
            role: 'SOCIA DIRECTORA',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
        }
    ];

    return (
        <div style={{ color: 'white', maxWidth: '1200px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>
            {/* "Nuestra Historia" Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Nuestra Historia</h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--accent-gold)', margin: '1rem auto 2rem auto', borderRadius: '2px' }}></div>
                <p style={{ color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1px', fontSize: '1rem', marginBottom: '4rem' }}>
                    Excelencia legal y compromiso inquebrantable desde nuestra fundación en 1998.
                </p>

                <Card style={{
                    padding: '4rem',
                    backgroundColor: 'rgba(26, 37, 56, 0.4)',
                    border: '1px solid var(--border-color)',
                    maxWidth: '900px',
                    margin: '0 auto',
                    textAlign: 'left'
                }}>
                    <p style={{ marginBottom: '2rem', lineHeight: '2', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Desde su fundación, <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>lexContract</span> ha nacido con la visión de transformar la práctica legal a través de la innovación y la integridad. Lo que comenzó como un pequeño despacho en el corazón del centro financiero se ha convertido en una firma líder de alcance internacional.
                    </p>
                    <p style={{ marginBottom: '3rem', lineHeight: '2', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Nuestra trayectoria está marcada por la representación de clientes en los litigios más complejos del sector corporativo, manteniendo siempre un enfoque humano y profundamente ético. Hemos evolucionado con las leyes y la tecnología, asegurando que cada contrato y cada defensa se sustente en el rigor jurídico y la vanguardia estratégica.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center' }}>
                        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-color)' }}></div>
                        <Scale size={24} style={{ color: 'var(--accent-gold)' }} />
                        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-color)' }}></div>
                    </div>
                </Card>
            </div>

            {/* "Nuestros Fundadores" Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Nuestros Fundadores</h2>
                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--accent-gold)', margin: '1rem auto 4rem auto', borderRadius: '2px' }}></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    {teamMembers.map((member, i) => (
                        <Card key={i} style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '1.5rem', backgroundColor: '#0a0e14' }}>
                            <div style={{ height: '500px', overflow: 'hidden' }}>
                                <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#0A2A4E' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{member.name}</h3>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '1px' }}>{member.role}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Mission & Vision Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Card style={{ padding: '3.5rem', backgroundColor: '#1a2538', borderRadius: '1.5rem' }}>
                    <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '2rem' }}>
                        <Target size={28} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Nuestra Misión</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                        Proveer soluciones legales innovadoras con el más alto estándar de integridad, protegiendo los intereses de nuestros clientes y promoviendo la justicia con excelencia técnica y compromiso ético inquebrantable.
                    </p>
                </Card>

                <Card style={{ padding: '3.5rem', backgroundColor: '#1a2538', borderRadius: '1.5rem' }}>
                    <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '2rem' }}>
                        <Compass size={28} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Nuestra Visión</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                        Consolidarnos como la firma de abogados líder en el mercado legal, reconocidos por nuestra capacidad de anticipar cambios jurídicos y nuestra firme dedicación a la transformación positiva del entorno legal global.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default AboutUs;
