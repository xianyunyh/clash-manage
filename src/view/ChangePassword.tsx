import Layout from './Layout'

interface ChangePasswordFormProps {
  message?: string
  error?: boolean
  success?: boolean
}

export default function ChangePasswordForm({
  message,
  error = false,
  success = false
}: ChangePasswordFormProps) {
  return (
    <Layout>
      <h1>修改登录凭据</h1>
      
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
      
      <form method="post" action="/admin/change-password">
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
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }} htmlFor="confirmPassword">
            确认密码
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
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
          修改凭据
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            padding: '8px 15px',
            textDecoration: 'none',
            color: '#2196F3'
          }}
        >
          返回首页
        </a>
      </div>
    </Layout>
  )
}