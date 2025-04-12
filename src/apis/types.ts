// 订阅相关接口
export interface Subscription {
  id: string
  url: string
  name: string
  createdAt: string
  rules?: Rule[]
  nodes?: Node[]
}

// 规则相关接口
export interface Rule {
  id: string
  type: string
  content: string
  policy: string
  createdAt: string
}

// 节点相关接口
export interface Node {
  id: string
  name: string
  type: string
  server: string
  port: number
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
  createdAt: string
}

// 辅助函数：验证URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}