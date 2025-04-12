import { FC } from 'hono/jsx'
import Layout from './Layout'

interface Node {
  id: string
  name: string
  type: string
  server: string
  port?: number
  password?: string
  uuid?: string
  cipher?: string
  udp?: boolean
  tls?: boolean
  skip_cert_verify?: boolean
  servername?: string
  network?: string
  ws_path?: string
  ws_headers?: Record<string, string>
  grpc_service_name?: string
  alterId?: number
}

interface NodeListProps {
  subId: string
  subName: string
  nodes: Node[]
}

const NodeList: FC<NodeListProps> = ({ subId, subName, nodes }) => {
  return (
    <Layout>
      <h1>{subName} 的节点管理</h1>
      <div style={{ marginBottom: '20px' }}>
        <a 
          href={`/subscription/${subId}/node/add`} 
          style={{ 
            display: 'inline-block',
            background: '#4CAF50', 
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          添加新节点
        </a>
        <a 
          href="/subscriptions" 
          style={{ 
            display: 'inline-block',
            background: '#2196F3', 
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          返回订阅列表
        </a>
      </div>

      {nodes.length === 0 ? (
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          <p>当前没有自定义节点</p>
          <p style={{ fontSize: '14px', color: '#666' }}>点击"添加新节点"按钮来创建您的第一个自定义节点</p>
        </div>
      ) : (
        <div>
          {nodes.map(node => (
            <div key={node.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{node.name}</h3>
                <div>
                  <a 
                    href={`/subscription/${subId}/node/${node.id}/edit`}
                    style={{ 
                      background: '#ffc107',
                      color: 'black',
                      padding: '5px 10px',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      marginRight: '10px',
                      fontSize: '14px'
                    }}
                  >
                    编辑
                  </a>
                  <a 
                    href={`/subscription/${subId}/node/${node.id}/delete`}
                    style={{ 
                      background: '#f44336',
                      color: 'white',
                      padding: '5px 10px',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    删除
                  </a>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <p><strong>类型:</strong> {node.type}</p>
                <p><strong>服务器:</strong> {node.server}</p>
                <p><strong>端口:</strong> {node.port}</p>
                {node.tls && <p><strong>TLS:</strong> 启用</p>}
                {node.network && <p><strong>网络类型:</strong> {node.network}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default NodeList