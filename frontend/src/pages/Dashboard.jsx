import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()

    const [authStatus, setAuthStatus] = useState('checking')

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            setAuthStatus('denied')
            return
        }

        async function verifyToken() {
            try {
                const response = await fetch(
                    'http://localhost:8000/api/protected',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

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

            <Link
                to="/customers"
                className="customers-widget customers-widget-link"
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
                        Manage customer records, contact details, and notes.
                    </p>
                </div>

                <span className="customers-widget-status">
                    Open module →
                </span>
            </Link>
        </section>
    )
}

export default Dashboard