import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register(){

    const [email, setEmail] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event) {
    event.preventDefault()

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
                throw new Error(data.error || 'Registeration failed')
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
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Register Page</h1>
                <p>Welcome back to DitaCRM!</p>

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <label htmlFor="businessName">Business Name</label>
                <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                />

                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <p>{message}</p>
                <button type="submit">Create Account</button>
            </form>
        </div>
    )
}

export default Register