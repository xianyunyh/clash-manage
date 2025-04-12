import { FC } from 'hono/jsx'
import Layout from './Layout'

interface NodeFormProps {
  subId: string
  subName: string
  message?: string
  error?: boolean
  initialValues?: {
    name?: string
    type?: string
    server?: string
    port?: number
    password?: string
    uuid?: string
    cipher?: string
    tls?: boolean
    skip_cert_verify?: boolean
    servername?: string
    network?: string
    ws_path?: string
    udp?: boolean
    grpc_service_name?: string
  }
  isEdit?: boolean
  nodeId?: string
}

const NodeForm: FC<NodeFormProps> = ({ 
  subId, 
  subName, 
  message, 
  error, 
  initialValues = {}, 
  isEdit = false,
  nodeId
}) => {
  // 默认值处理
  const {
    name = '', 
    type = 'shadowsocks',
    server = '',
    port = 443,
    password = '',
    uuid = '',
    cipher = 'chacha20-ietf-poly1305',
    tls = false,
    skip_cert_verify = false,
    servername = '',
    network = '',
    ws_path = '',
    udp = true,
    grpc_service_name = ''
  } = initialValues;

  const formAction = isEdit 
    ? `/subscription/${subId}/node/${nodeId}/edit` 
    : `/subscription/${subId}/node/add`;
    
  return (
    <Layout>
      <h1>{isEdit ? '编辑' : '添加'}节点 - {subName}</h1>
      {message && (
        <div style={{ 
          color: error ? 'red' : 'green', 
          margin: '10px 0',
          padding: '10px',
          background: error ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
      <form method="post" action={formAction}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            节点名称: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={name}
            required
            placeholder="为此节点起个名字"
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
          <label htmlFor="type" style={{ display: 'block', marginBottom: '5px' }}>
            节点类型: <span style={{ color: 'red' }}>*</span>
          </label>
          <select 
            id="type" 
            name="type" 
            value={type}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="shadowsocks">Shadowsocks</option>
            <option value="vmess">VMess</option>
            <option value="trojan">Trojan</option>
            <option value="socks5">SOCKS5</option>
            <option value="http">HTTP</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="server" style={{ display: 'block', marginBottom: '5px' }}>
            服务器地址: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="text" 
            id="server" 
            name="server" 
            value={server}
            required
            placeholder="server.example.com 或 IP 地址"
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
          <label htmlFor="port" style={{ display: 'block', marginBottom: '5px' }}>
            端口: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="number" 
            id="port" 
            name="port" 
            value={port}
            required
            min="1"
            max="65535"
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {/* Shadowsocks 和 SOCKS5 特有字段 */}
        <div id="passwordField" style={{ 
          marginBottom: '15px', 
          display: ['shadowsocks', 'socks5', 'http'].includes(type) ? 'block' : 'none' 
        }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            密码:
          </label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            placeholder="服务器密码"
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {/* Vmess 特有字段 */}
        <div id="uuidField" style={{ 
          marginBottom: '15px', 
          display: type === 'vmess' ? 'block' : 'none' 
        }}>
          <label htmlFor="uuid" style={{ display: 'block', marginBottom: '5px' }}>
            UUID:
          </label>
          <input 
            type="text" 
            id="uuid" 
            name="uuid" 
            value={uuid}
            placeholder="VMess UUID"
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {/* Shadowsocks 加密方式 */}
        <div id="cipherField" style={{ 
          marginBottom: '15px', 
          display: type === 'shadowsocks' ? 'block' : 'none' 
        }}>
          <label htmlFor="cipher" style={{ display: 'block', marginBottom: '5px' }}>
            加密方式:
          </label>
          <select 
            id="cipher" 
            name="cipher" 
            value={cipher}
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="chacha20-ietf-poly1305">chacha20-ietf-poly1305</option>
            <option value="aes-128-gcm">aes-128-gcm</option>
            <option value="aes-256-gcm">aes-256-gcm</option>
            <option value="aes-128-cfb">aes-128-cfb</option>
            <option value="aes-256-cfb">aes-256-cfb</option>
          </select>
        </div>

        {/* TLS 相关设置 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              id="tls" 
              name="tls" 
              checked={tls}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="tls">
              启用 TLS
            </label>
          </div>
        </div>

        <div id="tlsOptions" style={{ 
          marginBottom: '15px', 
          display: tls ? 'block' : 'none',
          padding: '10px',
          background: '#f9f9f9',
          borderRadius: '4px' 
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="skip_cert_verify" 
                name="skip_cert_verify" 
                checked={skip_cert_verify}
                style={{ marginRight: '5px' }}
              />
              <label htmlFor="skip_cert_verify">
                跳过证书验证 (不安全)
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="servername" style={{ display: 'block', marginBottom: '5px' }}>
              SNI (服务器名称指示):
            </label>
            <input 
              type="text" 
              id="servername" 
              name="servername" 
              value={servername}
              placeholder="例如: example.com"
              style={{ 
                width: '100%', 
                padding: '8px', 
                boxSizing: 'border-box',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        {/* 网络类型选择 */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="network" style={{ display: 'block', marginBottom: '5px' }}>
            网络类型:
          </label>
          <select 
            id="network" 
            name="network" 
            value={network}
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">默认</option>
            <option value="ws">WebSocket</option>
            <option value="grpc">gRPC</option>
          </select>
        </div>

        {/* WebSocket 路径 */}
        <div id="wsOptions" style={{ 
          marginBottom: '15px', 
          display: network === 'ws' ? 'block' : 'none',
          padding: '10px',
          background: '#f9f9f9',
          borderRadius: '4px' 
        }}>
          <label htmlFor="ws_path" style={{ display: 'block', marginBottom: '5px' }}>
            WebSocket 路径:
          </label>
          <input 
            type="text" 
            id="ws_path" 
            name="ws_path" 
            value={ws_path}
            placeholder="例如: /path"
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {/* gRPC 服务名称 */}
        <div id="grpcOptions" style={{ 
          marginBottom: '15px', 
          display: network === 'grpc' ? 'block' : 'none',
          padding: '10px',
          background: '#f9f9f9',
          borderRadius: '4px' 
        }}>
          <label htmlFor="grpc_service_name" style={{ display: 'block', marginBottom: '5px' }}>
            gRPC 服务名称:
          </label>
          <input 
            type="text" 
            id="grpc_service_name" 
            name="grpc_service_name" 
            value={grpc_service_name}
            placeholder="例如: example"
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {/* UDP 支持 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              id="udp" 
              name="udp" 
              checked={udp}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="udp">
              启用 UDP
            </label>
          </div>
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
            {isEdit ? '保存修改' : '添加节点'}
          </button>
          <a 
            href={`/subscription/${subId}/nodes`} 
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

      {/* JS 脚本用于处理表单字段的动态显示/隐藏 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const typeSelect = document.getElementById('type');
            const passwordField = document.getElementById('passwordField');
            const uuidField = document.getElementById('uuidField');
            const cipherField = document.getElementById('cipherField');
            const tlsCheckbox = document.getElementById('tls');
            const tlsOptions = document.getElementById('tlsOptions');
            const networkSelect = document.getElementById('network');
            const wsOptions = document.getElementById('wsOptions');
            const grpcOptions = document.getElementById('grpcOptions');

            // 初始化表单状态
            updateFormFields();

            // 添加事件监听器
            typeSelect.addEventListener('change', updateFormFields);
            tlsCheckbox.addEventListener('change', updateTlsOptions);
            networkSelect.addEventListener('change', updateNetworkOptions);

            function updateFormFields() {
              const type = typeSelect.value;

              // 处理密码字段
              passwordField.style.display = ['shadowsocks', 'socks5', 'http'].includes(type) ? 'block' : 'none';

              // 处理UUID字段
              uuidField.style.display = type === 'vmess' ? 'block' : 'none';

              // 处理加密方式字段
              cipherField.style.display = type === 'shadowsocks' ? 'block' : 'none';
            }

            function updateTlsOptions() {
              tlsOptions.style.display = tlsCheckbox.checked ? 'block' : 'none';
            }

            function updateNetworkOptions() {
              const network = networkSelect.value;
              wsOptions.style.display = network === 'ws' ? 'block' : 'none';
              grpcOptions.style.display = network === 'grpc' ? 'block' : 'none';
            }
          });
        `
      }}/>
    </Layout>
  )
}

export default NodeForm