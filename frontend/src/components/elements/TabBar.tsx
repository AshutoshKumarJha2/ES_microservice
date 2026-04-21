import React from 'react'
import { Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export const TabBar = ({ SUB_TABS}: { SUB_TABS: { to: string; label: string }[]}) => {
    return (
        <div className="border-bottom" style={{ background: 'var(--bg-surface)' }}>
                <Container fluid className="px-3 px-md-4">
                    <div className="d-flex align-items-center gap-3 py-2 flex-wrap">
                        
                        <nav className="d-flex gap-1">
                            {SUB_TABS.map(({ to, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `nav-link px-3 py-1 rounded-2 small fw-medium${isActive ? ' fw-semibold' : ''}`
                                    }
                                    style={({ isActive }) => ({
                                        color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                                    })}
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </Container>
            </div>
    )
}
