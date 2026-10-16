import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:8000/api/employees'

function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const fetchEmployees = useCallback(async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setError('Your session has expired. Please sign in again.')
            setLoading(false)
            return
        }

        try {
            setError('')

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || 'Employees could not be loaded.'
                )
            }

            setEmployees(data.employees || [])
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    function handleInputChange(event) {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || 'Employee could not be created.'
                )
            }

            setEmployees((current) => [
                ...current,
                data.employee,
            ])

            setFormData({
                name: '',
                email: '',
                password: '',
            })

            setShowForm(false)
            setSuccess('Employee added successfully.')
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setSubmitting(false)
        }
    }

    function handleSignOut() {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    return (
        <div className="employees-layout">
            <aside className="employees-sidebar">
                <Link to="/dashboard" className="employees-brand">
                    DitaCRM
                </Link>

                <p className="employees-sidebar-label">WORKSPACE</p>

                <nav className="employees-navigation">
                    <Link
                        to="/dashboard"
                        className="employees-nav-link"
                    >
                        Overview
                    </Link>

                    <a
                        href="#customers"
                        className="dashboard-nav-item"
                    >
                        Customers
                    </a>

                    <a
                        href="#products"
                        className="dashboard-nav-item"
                    >
                        Products
                    </a>

                    <Link
                        to="/employees"
                        className="employees-nav-link active"
                        aria-current="page"
                    >
                        Employees
                    </Link>
                </nav>

                <button
                    type="button"
                    className="employees-signout"
                    onClick={handleSignOut}
                >
                    ↪ Sign out
                </button>
            </aside>

            <main className="employees-main">
                <header className="employees-topbar">
                    <span>Workspace / Employees</span>
                </header>

                <section className="employees-content">
                    <div className="employees-heading">
                        <div>
                            <p className="employees-overline">
                                TEAM MANAGEMENT
                            </p>

                            <h1>Employees</h1>

                            <p className="employees-subtitle">
                                Manage the people who work with your business.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="employees-primary-button"
                            onClick={() => {
                                setError('')
                                setSuccess('')
                                setShowForm((current) => !current)
                            }}
                        >
                            {showForm ? 'Cancel' : '+ Add employee'}
                        </button>
                    </div>

                    {error && (
                        <div className="employees-alert employees-alert-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="employees-alert employees-alert-success">
                            {success}
                        </div>
                    )}

                    {showForm && (
                        <section className="employees-panel employees-form-panel">
                            <div className="employees-panel-heading">
                                <div>
                                    <h2>Add a new employee</h2>
                                    <p>
                                        Create an account for your team member.
                                    </p>
                                </div>
                            </div>

                            <form
                                className="employees-form"
                                onSubmit={handleSubmit}
                            >
                                <label>
                                    Full name
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. John Smith"
                                        autoComplete="name"
                                        required
                                    />
                                </label>

                                <label>
                                    Email address
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@company.com"
                                        autoComplete="email"
                                        required
                                    />
                                </label>

                                <label>
                                    Temporary password
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                </label>

                                <p className="employees-form-note">
                                    The employee account will be created
                                    with the EMPLOYEE role.
                                </p>

                                <div className="employees-form-actions">
                                    <button
                                        type="button"
                                        className="employees-secondary-button"
                                        onClick={() => setShowForm(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="employees-primary-button"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? 'Creating...'
                                            : 'Create employee'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="employees-panel">
                        <div className="employees-panel-heading">
                            <div>
                                <h2>Your team</h2>
                                <p>
                                    Employees belonging to your business.
                                </p>
                            </div>

                            <span className="employees-count">
                                {employees.length}{' '}
                                {employees.length === 1
                                    ? 'employee'
                                    : 'employees'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="employees-empty-state">
                                Loading employees...
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="employees-empty-state">
                                <div
                                    className="employees-empty-icon"
                                    aria-hidden="true"
                                >
                                    ♧
                                </div>

                                <h3>No employees yet</h3>

                                <p>
                                    Add your first team member to get started.
                                </p>

                                <button
                                    type="button"
                                    className="employees-primary-button"
                                    onClick={() => setShowForm(true)}
                                >
                                    + Add your first employee
                                </button>
                            </div>
                        ) : (
                            <div className="employees-table-wrapper">
                                <table className="employees-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Email address</th>
                                            <th>Role</th>
                                            <th>Date added</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td>
                                                    <div className="employees-person">
                                                        <span className="employees-avatar">
                                                            {employee.name
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>

                                                        <span className="employees-person-name">
                                                            {employee.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>{employee.email}</td>

                                                <td>
                                                    <span className="employees-role-badge">
                                                        {employee.role}
                                                    </span>
                                                </td>

                                                <td>
                                                    {employee.created_at
                                                        ? new Date(
                                                            employee.created_at
                                                        ).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </section>

                <footer className="employees-footer">
                    DitaCRM <span>·</span> Your business, in sync.
                </footer>
            </main>
        </div>
    )
}

export default Employees