import { FC } from 'hono/jsx'

const AddSubscriptionForm: FC<{ message?: string, error?: boolean }> = (props) => {
  return (
    <div>
      <h1>添加 Clash 订阅</h1>
      {props.message && (
        <div style={{ color: props.error ? 'red' : 'green', margin: '10px 0' }}>
          {props.message}
        </div>
      )}
      <form method="post" action="/subscription/add">
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="subUrl" style={{ display: 'block', marginBottom: '5px' }}>
            订阅链接:
          </label>
          <input 
            type="url" 
            id="subUrl" 
            name="subUrl" 
            placeholder="请输入有效的 Clash 订阅链接" 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            订阅名称:
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="为这个订阅起个名字（可选）" 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
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
            borderRadius: '4px'
          }}
        >
          添加订阅
        </button>
      </form>
    </div>
  )
}

export default AddSubscriptionForm