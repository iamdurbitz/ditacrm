import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
        return <p>Checking authentication...</p>
    }

    if (authStatus === 'denied') {
        return <p>Access denied. Redirecting to login...</p>
    }

    if (authStatus === 'error') {
        return <p>Unable to connect to the server. Please try again.</p>
    }

    return (
        <div>
            <h1>Dashboard Page</h1>
            <p>Welcome back to DitaCRM!</p>
        </div>
    )
}

export default Dashboard