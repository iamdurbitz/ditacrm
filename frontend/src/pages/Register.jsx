import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
    const [email, setEmail] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setMessage('')

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    businessName,
                    name,
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            setMessage('Registration successful! Redirecting to login...')

            setTimeout(() => {
                navigate('/login')
            }, 5000)
        } catch (error) {
            setMessage(error.message)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-shell auth-shell--register">
                <aside className="auth-brand-panel">

                    <div className="brand-copy">
                        <p className="brand-eyebrow">YOUR BUSINESS, IN SYNC</p>

                        <h2 className="brand-title">
                            A better way to run your business.
                        </h2>

                        <p className="brand-description">
                            Bring customer details and team operations into
                            one clear, organized workspace.
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
                        A CLEARER WAY TO WORK.
                    </p>
                </aside>

                <section className="auth-form-panel">
                    <div className="auth-form-wrap">
                        <div className="auth-heading">
                            <p className="auth-kicker">GET STARTED</p>

                            <h1 className="auth-title">
                                Create your workspace
                            </h1>

                            <p className="auth-subtitle">
                                A few details and you're ready to go.
                            </p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label className="form-label" htmlFor="businessName">
                                    Business name
                                </label>

                                <input
                                    className="form-input"
                                    id="businessName"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Your company name"
                                    value={businessName}
                                    onChange={(event) => setBusinessName(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="name">
                                    Your name
                                </label>

                                <input
                                    className="form-input"
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Full name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="email">
                                    Work email
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
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>

                            <p className="form-message" role="status">
                                {message}
                            </p>

                            <button className="primary-button" type="submit">
                                Create account <span aria-hidden="true">→</span>
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account?{' '}
                            <Link className="text-link" to="/login">
                                Sign in
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

export default Register