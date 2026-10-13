import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login(){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event) {
    event.preventDefault()

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
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Login Page</h1>
                <p>Welcome back to DitaCRM!</p>

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <p>{message}</p>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login