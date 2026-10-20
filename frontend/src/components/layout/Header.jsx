import { useLocation } from 'react-router-dom'

const PAGE_INFO = {
    '/dashboard': {
        title: 'Overview',
        eyebrow: 'WORKSPACE',
    },
    '/customers': {
        title: 'Customers',
        eyebrow: 'WORKSPACE',
    },
    '/employees': {
        title: 'Employees',
        eyebrow: 'WORKSPACE',
    },
    '/products': {
        title: 'Products',
        eyebrow: 'WORKSPACE',
    },
}

function Header() {
    const location = useLocation()

    const pageInfo = PAGE_INFO[location.pathname] ?? {
        title: 'Workspace',
        eyebrow: 'WORKSPACE',
    }

    return (
        <header className="dashboard-topbar">
            <div>
                <p className="dashboard-overline">
                    {pageInfo.eyebrow}
                </p>

                <p className="dashboard-breadcrumb">
                    {pageInfo.title}
                </p>
            </div>
        </header>
    )
}

export default Header