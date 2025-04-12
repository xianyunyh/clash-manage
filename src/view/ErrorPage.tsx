import Layout from './Layout'

interface ErrorPageProps {
  statusCode: 403 | 404
  title: string
  message: string
  backUrl?: string
  backText?: string
}

export default function ErrorPage({
  statusCode,
  title,
  message,
  backUrl = '/',
  backText = '返回首页'
}: ErrorPageProps) {
  // 根据不同状态码设置不同的颜色和图标
  const colors = {
    403: {
      primary: '#FF9800',
      light: '#FFF3E0',
      icon: '🔒'
    },
    404: {
      primary: '#2196F3',
      light: '#E3F2FD',
      icon: '🔍'
    }
  }

  const color = colors[statusCode]

  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        {/* 状态码显示 */}
        <div style={{
          fontSize: '96px',
          fontWeight: 'bold',
          color: color.primary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span>{statusCode}</span>
          <span style={{ marginLeft: '15px', fontSize: '84px' }}>{color.icon}</span>
        </div>
        
        {/* 错误标题 */}
        <h1 style={{
          fontSize: '28px',
          margin: '0 0 20px 0',
          color: '#424242'
        }}>
          {title}
        </h1>
        
        {/* 错误信息 */}
        <p style={{
          fontSize: '18px',
          margin: '0 0 30px 0',
          color: '#616161',
          maxWidth: '500px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        {/* 返回按钮 */}
        <a
          href={backUrl}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: color.primary,
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'background 0.3s ease'
          }}
        >
          {backText}
        </a>
      </div>
    </Layout>
  )
}