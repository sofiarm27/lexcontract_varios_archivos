import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, CheckCircle, Clock, FileWarning, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("Cargando...");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [data, user] = await Promise.all([
                    api.get('/stats/'),
                    api.get('/users/me')
                ]);
                setStats(data);
                setUserName(`${user.nombre} ${user.apellido}`);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('No se pudieron cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Cargando panel de control...</div>;
    }

    if (error) {
        return <div style={{ color: '#ef4444', textAlign: 'center', padding: '5rem' }}>{error}</div>;
    }

    const { firmStats, userStats } = stats;

    return (
        <div style={{ color: 'white' }}>
            {/* Welcome Header */}
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
                    ¡Bienvenido, {userName}!
                </h1>
                <p style={{ color: '#92a4c9', fontSize: '1rem' }}>
                    Resumen general de tu gestión y estadísticas de la firma.
                </p>
            </header>

            {/* Estadísticas Generales de la Firma */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#D4AF37' }}>
                    📊 Información General de la Firma
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Total Contratos de la Firma */}
                    <Card style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                        border: '1px solid #324467',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <FileText size={32} color="#3b82f6" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#92a4c9', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Total de Contratos
                                </p>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                                    {firmStats.totalContracts}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                                    De toda la firma
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Total Clientes de la Firma */}
                    <Card style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                        border: '1px solid #324467',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                            }}>
                                <Users size={32} color="#D4AF37" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#92a4c9', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Total de Clientes
                                </p>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                                    {firmStats.totalClients}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#D4AF37', marginTop: '0.25rem' }}>
                                    De toda la firma
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Estadísticas Específicas del Usuario */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#D4AF37' }}>
                    👤 Mi Información Personal
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Mis Contratos */}
                    <Card style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                        border: '1px solid #324467',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}>
                                <FileText size={28} color="#8b5cf6" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#92a4c9', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Mis Contratos
                                </p>
                                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                                    {userStats.myContracts}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.25rem' }}>
                                    Asignados a mí
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Mis Clientes Asociados */}
                    <Card style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #192233 0%, #1a2538 100%)',
                        border: '1px solid #324467',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                                <Users size={28} color="#22c55e" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#92a4c9', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Mis Clientes
                                </p>
                                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                                    {userStats.myClients}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.25rem' }}>
                                    Asociados a mí
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Estado de Contratos */}
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#D4AF37' }}>
                    📈 Estado de Mis Contratos
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {/* Contratos Vencidos */}
                    <Card style={{
                        padding: '1.75rem',
                        background: 'linear-gradient(135deg, #192233 0%, rgba(239, 68, 68, 0.05) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                padding: '0.875rem',
                                borderRadius: '0.75rem'
                            }}>
                                <FileWarning size={24} color="#ef4444" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#92a4c9', marginBottom: '0.375rem', fontWeight: 600 }}>
                                    Vencidos
                                </p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
                                    {userStats.contractStatus.expired}
                                </h3>
                            </div>
                        </div>
                    </Card>

                    {/* Contratos en Borrador */}
                    <Card style={{
                        padding: '1.75rem',
                        background: 'linear-gradient(135deg, #192233 0%, rgba(245, 158, 11, 0.05) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                padding: '0.875rem',
                                borderRadius: '0.75rem'
                            }}>
                                <Clock size={24} color="#f59e0b" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#92a4c9', marginBottom: '0.375rem', fontWeight: 600 }}>
                                    Borradores
                                </p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
                                    {userStats.contractStatus.drafts}
                                </h3>
                            </div>
                        </div>
                    </Card>

                    {/* Contratos Terminados */}
                    <Card style={{
                        padding: '1.75rem',
                        background: 'linear-gradient(135deg, #192233 0%, rgba(34, 197, 94, 0.05) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                padding: '0.875rem',
                                borderRadius: '0.75rem'
                            }}>
                                <CheckCircle size={24} color="#22c55e" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#92a4c9', marginBottom: '0.375rem', fontWeight: 600 }}>
                                    Terminados
                                </p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>
                                    {userStats.contractStatus.completed}
                                </h3>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
