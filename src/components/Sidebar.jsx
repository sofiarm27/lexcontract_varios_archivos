import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, HelpCircle } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = window.location;

    const allNavItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Panel de Control' },
        { path: '/clients', icon: Users, label: 'Clientes' },
        { path: '/contracts', icon: FileText, label: 'Contratos' },
        { path: '/users', icon: Settings, label: 'Usuarios / Roles', adminOnly: true },
    ];

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.get('/users/me');
                setUser(data);
            } catch (err) {
                console.error('Error fetching user in sidebar:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Check if user has admin role (admin or admin/abogado dual role)
    const isAdmin = user?.roles?.some(r => r.nombre.toLowerCase() === 'administrador') || false;

    // Filter nav items based on role
    const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <aside style={{
            width: '256px',
            backgroundColor: '#1a2332',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 50,
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            flexShrink: 0
        }}>
            <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                {/* Logo Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundImage: logo ? `url(${logo})` : 'none',
                        backgroundColor: !logo ? '#D4AF37' : 'transparent',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{
                            color: 'white',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            lineHeight: 1.5,
                            margin: 0,
                            fontFamily: '"Public Sans", "Inter", "Segoe UI", system-ui, sans-serif'
                        }}>
                            LexContract
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    paddingLeft: '0.75rem',
                                    paddingRight: '0.75rem',
                                    paddingTop: '0.5rem',
                                    paddingBottom: '0.5rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: active ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                                    color: active ? '#D4AF37' : 'white'
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <item.icon size={20} strokeWidth={2} />
                                <p style={{
                                    fontSize: '0.875rem',
                                    fontWeight: active ? 700 : 500,
                                    lineHeight: 1.5,
                                    margin: 0,
                                    fontFamily: '"Public Sans", "Inter", "Segoe UI", system-ui, sans-serif'
                                }}>
                                    {item.label}
                                </p>
                            </div>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {/* User Profile */}
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => navigate('/profile')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                paddingLeft: '0.5rem',
                                paddingRight: '0.5rem',
                                paddingTop: '0.5rem',
                                paddingBottom: '0.5rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                                opacity: loading ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#2a3647',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <span style={{
                                    color: '#D4AF37',
                                    fontSize: '0.875rem',
                                    fontWeight: 700
                                }}>
                                    {loading ? '...' : (user ? getInitials(user.nombre) : '?')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                <p style={{
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontFamily: '"Public Sans", "Inter", "Segoe UI", system-ui, sans-serif'
                                }}>
                                    {loading ? 'Cargando...' : (user?.nombre || 'Mi Perfil')}
                                </p>
                                <p style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    lineHeight: 1.5,
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontFamily: '"Public Sans", "Inter", "Segoe UI", system-ui, sans-serif'
                                }}>
                                    {loading ? 'Espere un momento' : (user?.roles?.length > 0 ? user.roles.map(r => r.nombre).join(' / ') : 'Ver detalles')}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Logout Button */}
                    <div
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            width: '100%',
                            cursor: 'pointer',
                            alignItems: 'center',
                            gap: '0.75rem',
                            borderRadius: '0.5rem',
                            paddingLeft: '0.75rem',
                            paddingRight: '0.75rem',
                            paddingTop: '0.5rem',
                            paddingBottom: '0.5rem',
                            color: '#f87171',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={20} strokeWidth={2} />
                        <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.5,
                            margin: 0,
                            fontFamily: '"Public Sans", "Inter", "Segoe UI", system-ui, sans-serif'
                        }}>
                            Cerrar Sesión
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
