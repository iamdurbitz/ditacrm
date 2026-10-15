import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setMessage('')

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            localStorage.setItem('token', data.token)
            navigate('/dashboard')
        } catch (error) {
            setMessage(error.message)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <aside className="auth-brand-panel">

                    <div className="brand-copy">
                        <p className="brand-eyebrow">YOUR BUSINESS, IN SYNC</p>

                        <h2 className="brand-title">
                            Clarity for every customer.
                        </h2>

                        <p className="brand-description">
                            Keep customer relationships and daily operations
                            organized in one clear workspace.
                        </p>

                        <div className="brand-highlights">
                            <div className="brand-highlight">
                                <span className="highlight-check">✓</span>
                                Customer relationships
                            </div>

                            <div className="brand-highlight">
                                <span className="highlight-check">✓</span>
                                Team workflows
                            </div>

                            <div className="brand-highlight">
                                <span className="highlight-check">✓</span>
                                Business insights
                            </div>
                        </div>
                    </div>

                    <p className="brand-panel-footer">
                        LESS CHAOS. MORE CLARITY.
                    </p>
                </aside>

                <section className="auth-form-panel">
                    <div className="auth-form-wrap">
                        <div className="auth-heading">
                            <p className="auth-kicker">WELCOME BACK</p>

                            <h1 className="auth-title">
                                Sign in to DitaCRM
                            </h1>

                            <p className="auth-subtitle">
                                Enter your details to access your workspace.
                            </p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label className="form-label" htmlFor="email">
                                    Email address
                                </label>

                                <input
                                    className="form-input"
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="password">
                                    Password
                                </label>

                                <input
                                    className="form-input"
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>

                            <p className="form-message" role="status">
                                {message}
                            </p>

                            <button className="primary-button" type="submit">
                                Sign in <span aria-hidden="true">→</span>
                            </button>
                        </form>

                        <p className="auth-switch">
                            New to DitaCRM?{' '}
                            <Link className="text-link" to="/register">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <p className="auth-footer">
                        DITACRM · BUILT FOR BETTER WORKFLOWS
                    </p>
                </section>
            </section>
        </main>
    )
}

export default Login