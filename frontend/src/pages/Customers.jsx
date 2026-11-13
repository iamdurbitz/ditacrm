import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000/api'

const EMPTY_FORM = {
    name: '',
    phone: '',
    address: '',
    total_amount: '0',
    amount_paid: '0',
    notes: '',
}

const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'USD',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

function formatCurrency(value) {
    const amount = Number(value ?? 0)

    return currencyFormatter.format(
        Number.isFinite(amount) ? amount : 0
    )
}

function formatDate(value) {
    if (!value) return 'Not provided'

    const date = new Date(value)

    return Number.isNaN(date.getTime())
        ? 'Not provided'
        : dateFormatter.format(date)
}

function formatValue(value) {
    return value === null || value === undefined || value === ''
        ? 'Not provided'
        : String(value)
}

function getInitial(name) {
    return String(name ?? '?').trim().charAt(0).toLocaleUpperCase('en-GB') || '?'
}

// Generate compact pagination numbers
function getPageNumbers(totalPages, currentPage) {
    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        )
    }

    const pages = [1]

    if (currentPage > 3) {
        pages.push('...')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let page = start; page <= end; page++) {
        pages.push(page)
    }

    if (currentPage < totalPages - 2) {
        pages.push('...')
    }

    pages.push(totalPages)

    return pages
}

function Customers() {
    const navigate = useNavigate()

    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const [pageError, setPageError] = useState('')
    const [formError, setFormError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    })

    const [showForm, setShowForm] = useState(false)
    const [editingCustomerId, setEditingCustomerId] = useState(null)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [form, setForm] = useState({ ...EMPTY_FORM })

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

    // Load customers from the backend
    const loadCustomers = useCallback(async () => {
        setLoading(true)
        setPageError('')

        try {
            await request('/protected')

            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(pageSize),
                search: searchTerm.trim(),
                sortBy
            })

            const data = await request(
                `/customers?${params.toString()}`
            )

            setCustomers(
                Array.isArray(data?.customers)
                    ? data.customers
                    : []
            )

            const newPagination = data?.pagination

            if (newPagination) {
                setPagination(newPagination)

                // Backend may move the user to the last valid page
                if (newPagination.currentPage !== currentPage) {
                    setCurrentPage(newPagination.currentPage)
                }
            }
        } catch (error) {
            setPageError(error.message || 'Could not load customers.')
        } finally {
            setLoading(false)
        }
    }, [
        request,
        currentPage,
        pageSize,
        searchTerm,
        sortBy
    ])

    useEffect(() => {
        loadCustomers()
    }, [loadCustomers])

    useEffect(() => {
        if (!successMessage) return

        const timeout = setTimeout(() => {
            setSuccessMessage('')
        }, 5000)

        return () => clearTimeout(timeout)
    }, [successMessage])

    useEffect(() => {
        const modalOpen = showForm || selectedCustomer !== null

        if (!modalOpen) return

        function handleKeyDown(event) {
            if (event.key === 'Escape' && !saving) {
                setShowForm(false)
                setEditingCustomerId(null)
                setFormError('')
                setSelectedCustomer(null)
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [showForm, selectedCustomer, saving])

    const formRemainingBalance = useMemo(() => {
        const total = Number(form.total_amount || 0)
        const paid = Number(form.amount_paid || 0)

        if (!Number.isFinite(total) || !Number.isFinite(paid)) {
            return 0
        }

        return total - paid
    }, [form.total_amount, form.amount_paid])

    function openCreateForm() {
        setSelectedCustomer(null)
        setEditingCustomerId(null)
        setForm({ ...EMPTY_FORM })
        setFormError('')
        setPageError('')
        setSuccessMessage('')
        setShowForm(true)
    }

    function openEditForm(customer) {
        setSelectedCustomer(null)
        setEditingCustomerId(customer.id)

        setForm({
            name: customer.name ?? '',
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            total_amount: String(customer.total_amount ?? 0),
            amount_paid: String(customer.amount_paid ?? 0),
            notes: customer.notes ?? '',
        })

        setFormError('')
        setPageError('')
        setSuccessMessage('')
        setShowForm(true)
    }

    function closeForm() {
        if (saving) return

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
        const totalAmount = Number(form.total_amount)
        const amountPaid = Number(form.amount_paid)

        if (
            form.total_amount.trim() === '' ||
            form.amount_paid.trim() === '' ||
            !Number.isFinite(totalAmount) ||
            !Number.isFinite(amountPaid) ||
            totalAmount < 0 ||
            amountPaid < 0
        ) {
            setFormError(
                'Total amount and amount paid must be valid non-negative numbers.'
            )
            setSaving(false)
            return
        }

        if (amountPaid > totalAmount) {
            setFormError('Amount paid cannot exceed the total amount.')
            setSaving(false)
            return
        }

        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            total_amount: form.total_amount,
            amount_paid: form.amount_paid,
            notes: form.notes.trim(),
        }

        try {
            await request(
                isEditing
                    ? `/customers/${encodeURIComponent(editingCustomerId)}`
                    : '/customers',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    body: JSON.stringify(payload),
                }
            )

            setShowForm(false)
            setEditingCustomerId(null)
            setForm({ ...EMPTY_FORM })

            setSuccessMessage(
                isEditing
                    ? 'Customer updated successfully.'
                    : 'Customer created successfully.'
            )

            // New customers are sorted by newest first
            if (!isEditing && currentPage !== 1) {
                setCurrentPage(1)
            } else {
                await loadCustomers()
            }
        } catch (error) {
            setFormError(error.message || 'Could not save customer.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(customer) {
        const confirmed = window.confirm(
            `Delete ${customer.name}? This action cannot be undone.`
        )

        if (!confirmed) return

        setDeletingId(customer.id)
        setPageError('')
        setSuccessMessage('')

        try {
            await request(
                `/customers/${encodeURIComponent(customer.id)}`,
                { method: 'DELETE' }
            )

            if (
                selectedCustomer &&
                String(selectedCustomer.id) === String(customer.id)
            ) {
                setSelectedCustomer(null)
            }

            setSuccessMessage('Customer deleted successfully.')

            // If the deleted customer was the only record on this page,
            // move to the previous page.
            if (customers.length === 1 && currentPage > 1) {
                setCurrentPage((page) => page - 1)
            } else {
                await loadCustomers()
            }
        } catch (error) {
            setPageError(error.message || 'Could not delete customer.')
        } finally {
            setDeletingId(null)
        }
    }

    function openCustomerDetails(customer) {
        setShowForm(false)
        setSelectedCustomer(customer)
    }

    function handleModalBackdropClick(event, closeModal) {
        if (event.target === event.currentTarget) {
            closeModal()
        }
    }

    const pageNumbers = getPageNumbers(
        pagination.totalPages,
        pagination.currentPage
    )

    const firstItem = pagination.totalItems === 0
        ? 0
        : (pagination.currentPage - 1) * pagination.limit + 1

    const lastItem = Math.min(
        pagination.currentPage * pagination.limit,
        pagination.totalItems
    )

    return (
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

            <section className="customers-panel">
                <div className="customers-panel-heading">
                    <div>
                        <h2>Customer directory</h2>
                        <p>
                            Search across customer details and notes as you type.
                        </p>
                    </div>

                    <span className="customers-count">
                        {pagination.totalItems}{' '}
                        {pagination.totalItems === 1 ? 'customer' : 'customers'}
                    </span>
                </div>

                <div className="customers-toolbar">
                    <label className="customers-search-field">
                        <span aria-hidden="true">⌕</span>

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value)
                                setCurrentPage(1)
                            }}
                            placeholder="Search name, phone, address, notes..."
                            aria-label="Search customers"
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCurrentPage(1)
                                }}
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
                            onChange={(event) => {
                                setSortBy(event.target.value)
                                setCurrentPage(1)
                            }}
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
                ) : customers.length === 0 ? (
                    <div className="customers-empty-state">
                        <div className="customers-empty-icon" aria-hidden="true">
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
                    <>
                        <div className="customers-table-wrapper">
                            <table className="customers-table">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Total Amount</th>
                                        <th>Amount Paid</th>
                                        <th>Remaining Balance</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {customers.map((customer) => {
                                        const total = Number(customer.total_amount ?? 0)
                                        const paid = Number(customer.amount_paid ?? 0)
                                        const remaining = Number(
                                            customer.remaining_balance ?? total - paid
                                        )

                                        return (
                                            <tr key={customer.id}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="customers-person customers-person-trigger"
                                                        onClick={() => openCustomerDetails(customer)}
                                                        title={`View ${customer.name}`}
                                                    >
                                                        <span
                                                            className="customers-person-name customers-truncated"
                                                            title={customer.name || ''}
                                                        >
                                                            {customer.name}
                                                        </span>
                                                    </button>
                                                </td>

                                                <td>
                                                    <span
                                                        className="customers-truncated customers-table-phone"
                                                        title={customer.phone || ''}
                                                    >
                                                        {customer.phone || '—'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className="customers-truncated customers-table-address"
                                                        title={customer.address || ''}
                                                    >
                                                        {customer.address || '—'}
                                                    </span>
                                                </td>

                                                <td>{formatCurrency(total)}</td>
                                                <td>{formatCurrency(paid)}</td>

                                                <td>
                                                    <strong
                                                        className={
                                                            remaining > 0
                                                                ? 'customers-balance-due'
                                                                : 'customers-balance-paid'
                                                        }
                                                    >
                                                        {formatCurrency(remaining)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className="customers-notes-cell customers-truncated"
                                                        title={customer.notes || ''}
                                                    >
                                                        {customer.notes || '—'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="customers-row-actions">
                                                        <button
                                                            type="button"
                                                            className="customers-row-button"
                                                            onClick={() => openEditForm(customer)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="customers-row-button customers-row-button-danger"
                                                            onClick={() => handleDelete(customer)}
                                                            disabled={
                                                                String(deletingId) === String(customer.id)
                                                            }
                                                        >
                                                            {String(deletingId) === String(customer.id)
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="customers-pagination">
                            <div className="customers-pagination-info">
                                Showing {firstItem}–{lastItem} of {pagination.totalItems} customers
                            </div>

                            <div className="customers-pagination-controls">
                                <label>
                                    Rows per page

                                    <select
                                        value={pageSize}
                                        onChange={(event) => {
                                            setPageSize(Number(event.target.value))
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    className="customers-secondary-button"
                                    disabled={!pagination.hasPreviousPage || loading}
                                    onClick={() => {
                                        setCurrentPage((page) => page - 1)
                                    }}
                                >
                                    Previous
                                </button>

                                <div className="customers-page-numbers">
                                    {pageNumbers.map((page, index) => (
                                        page === '...'
                                            ? (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="customers-pagination-ellipsis"
                                                >
                                                    ...
                                                </span>
                                            )
                                            : (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    className={
                                                        page === pagination.currentPage
                                                            ? 'customers-page-number active'
                                                            : 'customers-page-number'
                                                    }
                                                    aria-current={
                                                        page === pagination.currentPage
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    disabled={loading}
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="customers-secondary-button"
                                    disabled={!pagination.hasNextPage || loading}
                                    onClick={() => {
                                        setCurrentPage((page) => page + 1)
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {showForm && (
                <div
                    className="customers-modal-backdrop"
                    onMouseDown={(event) =>
                        handleModalBackdropClick(event, closeForm)
                    }
                >
                    <section
                        className="customers-modal customers-form-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="customers-form-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="customers-modal-header">
                            <div>
                                <p className="customers-modal-eyebrow">
                                    CUSTOMER RECORD
                                </p>

                                <h2 id="customers-form-modal-title">
                                    {editingCustomerId !== null
                                        ? 'Edit customer'
                                        : 'Add a customer'}
                                </h2>

                                <p>
                                    Fields marked with * are required.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="customers-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close customer form"
                            >
                                ×
                            </button>
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
                                    placeholder="e.g. Alex Morgan"
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

                            <label className="customers-form-full-width">
                                Address
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleFormChange}
                                    maxLength={2000}
                                    placeholder="Customer address"
                                />
                            </label>

                            <label>
                                Total amount (USD)
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    onChange={handleFormChange}
                                    min="0"
                                    max="9999999999.99"
                                    step="0.01"
                                    required
                                />
                            </label>

                            <label>
                                Amount paid (USD)
                                <input
                                    type="number"
                                    name="amount_paid"
                                    value={form.amount_paid}
                                    onChange={handleFormChange}
                                    min="0"
                                    max="9999999999.99"
                                    step="0.01"
                                    required
                                />
                            </label>

                            <div className="customers-balance-preview">
                                <span>Remaining balance</span>
                                <strong
                                    className={
                                        formRemainingBalance > 0
                                            ? 'customers-balance-due'
                                            : 'customers-balance-paid'
                                    }
                                >
                                    {formatCurrency(formRemainingBalance)}
                                </strong>
                            </div>

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
                                <p className="customers-form-error" role="alert">
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
                </div>
            )}

            {selectedCustomer && (
                <div
                    className="customers-modal-backdrop"
                    onMouseDown={(event) =>
                        handleModalBackdropClick(
                            event,
                            () => setSelectedCustomer(null)
                        )
                    }
                >
                    <section
                        className="customers-modal customers-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="customers-details-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="customers-modal-header">
                            <div className="customers-details-person">
                                <div>
                                    <p className="customers-modal-eyebrow">
                                        CUSTOMER DETAILS
                                    </p>

                                    <h2 id="customers-details-modal-title">
                                        {selectedCustomer.name}
                                    </h2>

                                    <p>
                                        Customer record and payment overview
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="customers-modal-close"
                                onClick={() => setSelectedCustomer(null)}
                                aria-label="Close customer details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="customers-details-balance">
                            <div>
                                <span>Total amount</span>
                                <strong>
                                    {formatCurrency(selectedCustomer.total_amount)}
                                </strong>
                            </div>

                            <div>
                                <span>Amount paid</span>
                                <strong>
                                    {formatCurrency(selectedCustomer.amount_paid)}
                                </strong>
                            </div>

                            <div>
                                <span>Remaining balance</span>
                                <strong
                                    className={
                                        Number(
                                            selectedCustomer.remaining_balance ??
                                            Number(selectedCustomer.total_amount ?? 0) -
                                            Number(selectedCustomer.amount_paid ?? 0)
                                        ) > 0
                                            ? 'customers-balance-due'
                                            : 'customers-balance-paid'
                                    }
                                >
                                    {formatCurrency(
                                        selectedCustomer.remaining_balance ??
                                        Number(selectedCustomer.total_amount ?? 0) -
                                        Number(selectedCustomer.amount_paid ?? 0)
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="customers-details-grid">
                            <div className="customers-detail-field">
                                <span>Full name</span>
                                <p>{formatValue(selectedCustomer.name)}</p>
                            </div>

                            <div className="customers-detail-field">
                                <span>Phone</span>
                                <p>{formatValue(selectedCustomer.phone)}</p>
                            </div>

                            <div className="customers-detail-field customers-detail-full-width">
                                <span>Address</span>
                                <p className="customers-detail-long-text">
                                    {formatValue(selectedCustomer.address)}
                                </p>
                            </div>

                            <div className="customers-detail-field customers-detail-full-width">
                                <span>Notes</span>
                                <p className="customers-detail-long-text">
                                    {formatValue(selectedCustomer.notes)}
                                </p>
                            </div>

                            <div className="customers-detail-field">
                                <span>Created</span>
                                <p>{formatDate(selectedCustomer.created_at)}</p>
                            </div>

                            <div className="customers-detail-field">
                                <span>Last updated</span>
                                <p>{formatDate(selectedCustomer.updated_at)}</p>
                            </div>
                        </div>

                        <div className="customers-form-actions customers-details-actions">
                            <button
                                type="button"
                                className="customers-secondary-button"
                                onClick={() => setSelectedCustomer(null)}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="customers-primary-button"
                                onClick={() => openEditForm(selectedCustomer)}
                            >
                                Edit customer
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

export default Customers