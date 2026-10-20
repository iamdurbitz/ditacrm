import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000/api'

function Sidebar() {
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        async function fetchUserRole() {
            try {
                const response = await fetch(`${API_URL}/protected`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token')
                        navigate('/login', { replace: true })
                    }

                    return
                }

                const data = await response.json()
                setUserRole(data.user?.role ?? null)
            } catch (error) {
                console.error('Could not load user role:', error)
            }
        }

        fetchUserRole()
    }, [navigate])

    function handleSignOut() {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }

    return (
        <aside className="dashboard-sidebar">
            <Link to="/dashboard" className="dashboard-logo">
                <span>DitaCRM</span>
            </Link>

            <div className="sidebar-section-label">
                WORKSPACE
            </div>

            <nav
                className="dashboard-nav"
                aria-label="Main navigation"
            >
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
                    }
                >
                    Overview
                </NavLink>

                <NavLink
                    to="/customers"
                    className={({ isActive }) =>
                        `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
                    }
                >
                    Customers
                </NavLink>

                {userRole === 'OWNER' && (
                    <NavLink
                        to="/employees"
                        className={({ isActive }) =>
                            `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
                        }
                    >
                        Employees
                    </NavLink>
                )}

                <NavLink
                    to="/products"
                    className={({ isActive }) =>
                        `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
                    }
                >
                    Products
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <button
                    type="button"
                    className="dashboard-nav-item dashboard-nav-item--signout"
                    onClick={handleSignOut}
                >
                    <span className="nav-item-icon" aria-hidden="true">
                        ↪
                    </span>
                    Sign out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar