import { FC } from 'hono/jsx'
import Layout from './Layout'

interface LoginProps {
    error?: boolean
    message?: string
}

const LoginPage: FC<LoginProps> = ({ error, message }) => {
    return (
        <Layout>
            <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                padding: '20px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '5px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Clash 订阅配置工具</h1>

                {message && (
                    <div style={{
                        marginBottom: '15px',
                        padding: '10px',
                        background: error ? '#ffebee' : '#e8f5e9',
                        color: error ? '#c62828' : '#2e7d32',
                        borderRadius: '4px'
                    }}>
                        {message}
                    </div>
                )}

                <form method="post" action="/login">
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }} htmlFor="username">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }} htmlFor="password">
                            密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: '#4CAF50',
                            border: 'none',
                            color: 'white',
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            width: '100%'
                        }}
                    >
                        登录
                    </button>
                </form>
            </div>
        </Layout>
    )
}

export default LoginPage