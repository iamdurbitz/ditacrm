import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000/api'

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
}

function Customers() {
    const navigate = useNavigate()

    const [customers, setCustomers] = useState([])
    const [userRole, setUserRole] = useState(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const [pageError, setPageError] = useState('')
    const [formError, setFormError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    const [showForm, setShowForm] = useState(false)
    const [editingCustomerId, setEditingCustomerId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)

    const request = useCallback(async (path, options = {}) => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login', { replace: true })
            throw new Error('Please sign in again.')
        }

        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body
                    ? { 'Content-Type': 'application/json' }
                    : {}),
                ...options.headers,
            },
        })

        let data = null

        try {
            data = await response.json()
        } catch {
            // The response may not contain JSON.
        }

        if (response.status === 401) {
            localStorage.removeItem('token')
            navigate('/login', { replace: true })
            throw new Error(
                'Your session has expired. Please sign in again.'
            )
        }

        if (!response.ok) {
            throw new Error(
                data?.error || data?.message || 'The request failed.'
            )
        }

        return data
    }, [navigate])

    const loadCustomers = useCallback(async () => {
        setLoading(true)
        setPageError('')

        try {
            // Get the authenticated user's role.
            const userData = await request('/protected')
            setUserRole(userData.user?.role ?? null)

            // Fetch customers belonging to the current business.
            const data = await request('/customers')

            setCustomers(
                Array.isArray(data?.customers)
                    ? data.customers
                    : []
            )
        } catch (error) {
            setPageError(
                error.message || 'Could not load customers.'
            )
        } finally {
            setLoading(false)
        }
    }, [request])

    useEffect(() => {
        loadCustomers()
    }, [loadCustomers])

    // Automatically dismiss success messages after five seconds.
    useEffect(() => {
        if (!successMessage) {
            return
        }

        const timeout = setTimeout(() => {
            setSuccessMessage('')
        }, 5000)

        return () => clearTimeout(timeout)
    }, [successMessage])

    // Search and sorting are performed locally, without API requests per keystroke.
    const filteredCustomers = useMemo(() => {
        const query = searchTerm
            .trim()
            .toLocaleLowerCase('tr-TR')

        const searchableFields = [
            'name',
            'email',
            'phone',
            'company',
            'address',
            'notes',
        ]

        const result = customers.filter((customer) => {
            if (!query) {
                return true
            }

            const searchableText = searchableFields
                .map((field) => customer[field] ?? '')
                .join(' ')
                .toLocaleLowerCase('tr-TR')

            return searchableText.includes(query)
        })

        return result.sort((a, b) => {
            if (sortBy === 'name-asc') {
                return String(a.name ?? '').localeCompare(
                    String(b.name ?? ''),
                    'tr-TR'
                )
            }

            if (sortBy === 'name-desc') {
                return String(b.name ?? '').localeCompare(
                    String(a.name ?? ''),
                    'tr-TR'
                )
            }

            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()

            return sortBy === 'oldest'
                ? dateA - dateB
                : dateB - dateA
        })
    }, [customers, searchTerm, sortBy])

    function openCreateForm() {
        setEditingCustomerId(null)
        setForm({ ...EMPTY_FORM })
        setFormError('')
        setSuccessMessage('')
        setShowForm(true)
    }

    function openEditForm(customer) {
        setEditingCustomerId(customer.id)

        setForm({
            name: customer.name ?? '',
            email: customer.email ?? '',
            phone: customer.phone ?? '',
            company: customer.company ?? '',
            address: customer.address ?? '',
            notes: customer.notes ?? '',
        })

        setFormError('')
        setSuccessMessage('')
        setShowForm(true)
    }

    function closeForm() {
        if (saving) {
            return
        }

        setShowForm(false)
        setEditingCustomerId(null)
        setForm({ ...EMPTY_FORM })
        setFormError('')
    }

    function handleFormChange(event) {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setSaving(true)
        setFormError('')
        setPageError('')
        setSuccessMessage('')

        const isEditing = editingCustomerId !== null

        try {
            const data = await request(
                isEditing
                    ? `/customers/${encodeURIComponent(editingCustomerId)}`
                    : '/customers',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    body: JSON.stringify(form),
                }
            )

            if (data?.customer) {
                setCustomers((current) => {
                    if (isEditing) {
                        return current.map((customer) =>
                            String(customer.id) ===
                            String(data.customer.id)
                                ? data.customer
                                : customer
                        )
                    }

                    return [data.customer, ...current]
                })
            } else {
                await loadCustomers()
            }

            setShowForm(false)
            setEditingCustomerId(null)
            setForm({ ...EMPTY_FORM })

            setSuccessMessage(
                isEditing
                    ? 'Customer updated successfully.'
                    : 'Customer created successfully.'
            )
        } catch (error) {
            setFormError(
                error.message || 'Could not save customer.'
            )
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(customer) {
        const confirmed = window.confirm(
            `Delete ${customer.name}? This action cannot be undone.`
        )

        if (!confirmed) {
            return
        }

        setDeletingId(customer.id)
        setPageError('')
        setSuccessMessage('')

        try {
            await request(
                `/customers/${encodeURIComponent(customer.id)}`,
                { method: 'DELETE' }
            )

            setCustomers((current) =>
                current.filter(
                    (item) => String(item.id) !== String(customer.id)
                )
            )

            setSuccessMessage('Customer deleted successfully.')
        } catch (error) {
            setPageError(
                error.message || 'Could not delete customer.'
            )
        } finally {
            setDeletingId(null)
        }
    }

    function handleSignOut() {
        localStorage.removeItem('token')
        setCustomers([])
        navigate('/login', { replace: true })
    }

    return (
        <div className="customers-layout">
            <aside className="customers-sidebar">
                <Link to="/dashboard" className="customers-brand">
                    DitaCRM
                </Link>

                <p className="customers-sidebar-label">
                    WORKSPACE
                </p>

                <nav
                    className="customers-navigation"
                    aria-label="Main navigation"
                >
                    <Link
                        to="/dashboard"
                        className="customers-nav-link"
                    >
                        <span aria-hidden="true">⌂</span>
                        Overview
                    </Link>

                    <Link
                        to="/customers"
                        className="customers-nav-link active"
                        aria-current="page"
                    >
                        <span aria-hidden="true">♙</span>
                        Customers
                    </Link>

                    {userRole === 'OWNER' && (
                        <Link
                            to="/employees"
                            className="customers-nav-link"
                        >
                            <span aria-hidden="true">♧</span>
                            Employees
                        </Link>
                    )}
                </nav>

                <button
                    type="button"
                    className="customers-signout"
                    onClick={handleSignOut}
                >
                    ↪ Sign out
                </button>
            </aside>

            <main className="customers-main">
                <header className="customers-topbar">
                    <div>
                        <p className="dashboard-overline">
                            WORKSPACE
                        </p>
                        <p className="dashboard-breadcrumb">
                            Customers
                        </p>
                    </div>

                    <span className="customers-topbar-caption">
                        Customer management
                    </span>
                </header>

                <section className="customers-content">
                    <div className="customers-heading">
                        <div>
                            <p className="customers-overline">
                                CUSTOMER RELATIONSHIPS
                            </p>

                            <h1>Customers</h1>

                            <p className="customers-subtitle">
                                Manage your customer information in one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="customers-primary-button"
                            onClick={openCreateForm}
                        >
                            + Add customer
                        </button>
                    </div>

                    {pageError && (
                        <div
                            className="customers-alert customers-alert-error"
                            role="alert"
                        >
                            {pageError}
                        </div>
                    )}

                    {successMessage && (
                        <div
                            className="customers-alert customers-alert-success"
                            role="status"
                        >
                            {successMessage}
                        </div>
                    )}

                    {showForm && (
                        <section className="customers-panel customers-form-panel">
                            <div className="customers-panel-heading">
                                <div>
                                    <h2>
                                        {editingCustomerId !== null
                                            ? 'Edit customer'
                                            : 'Add a customer'}
                                    </h2>

                                    <p>
                                        Fields marked with * are required.
                                    </p>
                                </div>
                            </div>

                            <form
                                className="customers-form"
                                onSubmit={handleSubmit}
                            >
                                <label>
                                    Full name *
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        maxLength={150}
                                        required
                                        autoFocus
                                        placeholder="e.g. Ahmet Yılmaz"
                                    />
                                </label>

                                <label>
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleFormChange}
                                        maxLength={255}
                                        placeholder="name@example.com"
                                    />
                                </label>

                                <label>
                                    Phone
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        maxLength={30}
                                        placeholder="Phone number"
                                    />
                                </label>

                                <label>
                                    Company
                                    <input
                                        name="company"
                                        value={form.company}
                                        onChange={handleFormChange}
                                        maxLength={150}
                                        placeholder="Company name"
                                    />
                                </label>

                                <label>
                                    Address
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleFormChange}
                                        maxLength={2000}
                                        placeholder="Customer address"
                                    />
                                </label>

                                <label className="customers-notes-field">
                                    Notes
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleFormChange}
                                        maxLength={10000}
                                        rows={4}
                                        placeholder="Additional details and notes"
                                    />
                                </label>

                                {formError && (
                                    <p
                                        className="customers-form-error"
                                        role="alert"
                                    >
                                        {formError}
                                    </p>
                                )}

                                <div className="customers-form-actions">
                                    <button
                                        type="button"
                                        className="customers-secondary-button"
                                        onClick={closeForm}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="customers-primary-button"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'Saving...'
                                            : editingCustomerId !== null
                                                ? 'Save changes'
                                                : 'Create customer'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="customers-panel">
                        <div className="customers-panel-heading">
                            <div>
                                <h2>Customer directory</h2>
                                <p>
                                    Search across customer details and notes as
                                    you type.
                                </p>
                            </div>

                            <span className="customers-count">
                                {filteredCustomers.length}{' '}
                                {filteredCustomers.length === 1
                                    ? 'customer'
                                    : 'customers'}
                            </span>
                        </div>

                        <div className="customers-toolbar">
                            <label className="customers-search-field">
                                <span aria-hidden="true">⌕</span>

                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search name, phone, company, notes..."
                                    aria-label="Search customers"
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </label>

                            <label className="customers-sort-field">
                                Sort by

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="name-asc">Name (A–Z)</option>
                                    <option value="name-desc">Name (Z–A)</option>
                                </select>
                            </label>

                            <button
                                type="button"
                                className="customers-secondary-button"
                                onClick={loadCustomers}
                                disabled={loading}
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="customers-empty-state">
                                <span
                                    className="customers-loading-spinner"
                                    aria-hidden="true"
                                />
                                <h3>Loading customers...</h3>
                                <p>Getting your customer records.</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="customers-empty-state">
                                <div
                                    className="customers-empty-icon"
                                    aria-hidden="true"
                                >
                                    ♙
                                </div>

                                <h3>
                                    {searchTerm
                                        ? 'No matching customers'
                                        : 'No customers yet'}
                                </h3>

                                <p>
                                    {searchTerm
                                        ? 'Try a different search term.'
                                        : 'Add your first customer to start building your directory.'}
                                </p>

                                {!searchTerm && (
                                    <button
                                        type="button"
                                        className="customers-primary-button"
                                        onClick={openCreateForm}
                                    >
                                        + Add customer
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="customers-table-wrapper">
                                <table className="customers-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Contact</th>
                                            <th>Company</th>
                                            <th>Address</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredCustomers.map((customer) => (
                                            <tr key={customer.id}>
                                                <td>
                                                    <div className="customers-person">
                                                        <span
                                                            className="customers-avatar"
                                                            aria-hidden="true"
                                                        >
                                                            {String(
                                                                customer.name ?? '?'
                                                            )
                                                                .trim()
                                                                .charAt(0)
                                                                .toLocaleUpperCase(
                                                                    'tr-TR'
                                                                )}
                                                        </span>

                                                        <span className="customers-person-name">
                                                            {customer.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="customers-contact">
                                                        {customer.email && (
                                                            <span>
                                                                {customer.email}
                                                            </span>
                                                        )}

                                                        {customer.phone && (
                                                            <span>
                                                                {customer.phone}
                                                            </span>
                                                        )}

                                                        {!customer.email &&
                                                            !customer.phone && (
                                                                <span className="customers-muted">
                                                                    No contact details
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>

                                                <td>
                                                    {customer.company || (
                                                        <span className="customers-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="customers-cell-wrap">
                                                    {customer.address || (
                                                        <span className="customers-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="customers-cell-wrap customers-notes-cell">
                                                    {customer.notes || (
                                                        <span className="customers-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="customers-row-actions">
                                                        <button
                                                            type="button"
                                                            className="customers-row-button"
                                                            onClick={() =>
                                                                openEditForm(customer)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="customers-row-button customers-row-button-danger"
                                                            onClick={() =>
                                                                handleDelete(customer)
                                                            }
                                                            disabled={
                                                                deletingId !== null
                                                            }
                                                        >
                                                            {deletingId === customer.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </section>

                <footer className="customers-footer">
                    DitaCRM <span>·</span> Your business, in sync.
                </footer>
            </main>
        </div>
    )
}

export default Customers