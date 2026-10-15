import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()

    const [authStatus, setAuthStatus] = useState('checking')

    function handleSignOut() {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            setAuthStatus('denied')
            return
        }

        async function verifyToken() {
            try {
                const response = await fetch('http://localhost:8000/api/protected', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    localStorage.removeItem('token')
                    setAuthStatus('denied')
                    return
                }

                setAuthStatus('authenticated')
            } catch (error) {
                console.error('Authentication error:', error)
                setAuthStatus('error')
            }
        }

        verifyToken()
    }, [])

    useEffect(() => {
        if (authStatus !== 'denied') {
            return
        }

        const timeout = setTimeout(() => {
            navigate('/login', { replace: true })
        }, 3000)

        return () => clearTimeout(timeout)
    }, [authStatus, navigate])

    if (authStatus === 'checking') {
        return (
            <main className="dashboard-status-page">
                <section className="status-card">
                    <div
                        className="status-indicator spinner"
                        aria-hidden="true"
                    />

                    <h1 className="status-title">
                        Checking your workspace...
                    </h1>

                    <p className="status-copy">
                        Verifying your secure connection.
                    </p>
                </section>
            </main>
        )
    }

    if (authStatus === 'denied') {
        return (
            <main className="dashboard-status-page">
                <section className="status-card">
                    <div
                        className="status-indicator status-denied"
                        aria-hidden="true"
                    />

                    <h1 className="status-title">
                        Access denied
                    </h1>

                    <p className="status-copy">
                        Your session is missing or expired.
                        Redirecting you to sign in...
                    </p>
                </section>
            </main>
        )
    }

    if (authStatus === 'error') {
        return (
            <main className="dashboard-status-page">
                <section className="status-card">
                    <div
                        className="status-indicator status-error"
                        aria-hidden="true"
                    />

                    <h1 className="status-title">
                        Couldn't connect to the server
                    </h1>

                    <p className="status-copy">
                        Check that the DitaCRM server is running,
                        then refresh this page.
                    </p>
                </section>
            </main>
        )
    }

    return (
        <div className="dashboard-page">
            <aside className="dashboard-sidebar">
                <div className="dashboard-logo">
                    <span>DitaCRM</span>
                </div>

                <div className="sidebar-section-label">
                    WORKSPACE
                </div>

                <nav className="dashboard-nav" aria-label="Main navigation">
                    <a
                        href="/dashboard"
                        className="dashboard-nav-item dashboard-nav-item--active"
                        aria-current="page"
                    >
                        <span className="nav-item-icon">◫</span>
                        Overview
                    </a>

                    <a
                        href="#customers"
                        className="dashboard-nav-item"
                    >
                        <span className="nav-item-icon">♙</span>
                        Customers
                    </a>

                    <a
                        href="#products"
                        className="dashboard-nav-item"
                    >
                        <span className="nav-item-icon">▤</span>
                        Products
                    </a>

                    <a
                        href="#employees"
                        className="dashboard-nav-item"
                    >
                        <span className="nav-item-icon">♧</span>
                        Employees
                    </a>
                </nav>

                <div className="sidebar-bottom">

                    <button
                        type="button"
                        className="dashboard-nav-item dashboard-nav-item--signout"
                        onClick={handleSignOut}
                    >
                        <span className="nav-item-icon">↪</span>
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <p className="dashboard-overline">
                            WORKSPACE
                        </p>

                        <p className="dashboard-breadcrumb">
                            Overview
                        </p>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="dashboard-page-heading">
                        <p className="dashboard-overline">
                            YOUR WORKSPACE
                        </p>

                        <h1 className="dashboard-welcome">
                            Overview
                        </h1>

                        <p className="dashboard-page-subtitle">
                            A clear view of your business, one step at a time.
                        </p>
                    </div>

                    <section
                        className="customers-widget"
                        id="customers"
                        aria-labelledby="customers-widget-title"
                    >
                        <div
                            className="customers-widget-icon"
                            aria-hidden="true"
                        >
                            ♙
                        </div>

                        <div className="customers-widget-copy">
                            <p className="panel-label">
                                WORKSPACE MODULE
                            </p>

                            <h2 id="customers-widget-title">
                                Customers
                            </h2>

                            <p>
                                Your customer workspace will take shape here.
                            </p>
                        </div>

                        <span className="customers-widget-status">
                            In progress
                        </span>
                    </section>
                </section>

                <footer className="dashboard-footer">
                    DitaCRM <span>·</span> Your business, in sync.
                </footer>
            </main>
        </div>
    )
}

export default Dashboard