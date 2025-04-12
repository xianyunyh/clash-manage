import { FC } from 'hono/jsx'
import Layout from './Layout'

const EditSubscriptionForm: FC<{ 
  subId: string, 
  subName: string, 
  subUrl: string,
  message?: string, 
  error?: boolean 
}> = (props) => {
  return (
    <Layout>
      <h1>修改订阅链接</h1>
      {props.message && (
        <div style={{ 
          color: props.error ? 'red' : 'green', 
          margin: '10px 0',
          padding: '10px',
          background: props.error ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px'
        }}>
          {props.message}
        </div>
      )}
      <form method="post" action={`/subscription/${props.subId}/edit`}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            订阅名称:
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={props.subName}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="subUrl" style={{ display: 'block', marginBottom: '5px' }}>
            订阅链接:
          </label>
          <input 
            type="url" 
            id="subUrl" 
            name="subUrl" 
            value={props.subUrl}
            placeholder="请输入有效的 Clash 订阅链接" 
            required 
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            style={{ 
              background: '#4CAF50', 
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              flexGrow: '1'
            }}
          >
            保存修改
          </button>
          <a 
            href="/subscriptions" 
            style={{ 
              background: '#9e9e9e',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: '1'
            }}
          >
            取消
          </a>
        </div>
      </form>
    </Layout>
  )
}

export default EditSubscriptionForm