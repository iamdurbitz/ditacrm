import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

function AppLayout() {
    return (
        <div className="dashboard-page">
            <Sidebar />

            <main className="dashboard-main">
                <Header />

                <div className="app-layout-content">
                    <Outlet />
                </div>

                <Footer />
            </main>
        </div>
    )
}

export default AppLayout