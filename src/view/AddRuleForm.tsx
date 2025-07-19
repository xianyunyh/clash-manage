import { FC } from 'hono/jsx'
import Layout from './Layout'

const AddRuleForm: FC<{ 
  subId: string, 
  subName: string, 
  message?: string, 
  error?: boolean 
}> = (props) => {
  return (
    <Layout>
      <h1>为 "{props.subName}" 添加规则</h1>
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
      <form method="post" action={`/subscription/${props.subId}/rule/add`}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ruleType" style={{ display: 'block', marginBottom: '5px' }}>
            规则类型:
          </label>
          <select 
            id="ruleType" 
            name="ruleType" 
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX（域名后缀）</option>
            <option value="DOMAIN">DOMAIN（精确域名）</option>
            <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD（域名关键词）</option>
            <option value="IP-CIDR">IP-CIDR（IP段）</option>
            <option value="IP-CIDR6">IP-CIDR6（IPv6段）</option>
            <option value="GEOIP">GEOIP（地理位置IP）</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ruleContent" style={{ display: 'block', marginBottom: '5px' }}>
            规则内容:
          </label>
          <input 
            type="text" 
            id="ruleContent" 
            name="ruleContent" 
            placeholder="例如：google.com 或 8.8.8.8/32" 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="rulePolicy" style={{ display: 'block', marginBottom: '5px' }}>
            策略:
          </label>
          <select 
            id="rulePolicy" 
            name="rulePolicy" 
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="DIRECT">DIRECT（直连）</option>
            <option value="REJECT">REJECT（拒绝）</option>
            <option value="Proxy">PROXY（代理）</option>
          </select>
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
            添加规则
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
            返回列表
          </a>
        </div>
      </form>
    </Layout>
  )
}

export default AddRuleForm