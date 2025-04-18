import { Context, Next } from 'hono'
import { Env } from '../bindings'
import ErrorPage from '../view/ErrorPage'

/**
 * HTTP Basic Auth 中间件
 * 用于保护 Clash 配置管理系统的访问安全
 */
export async function basicAuth(c: Context<{ Bindings: Env }>, next: Next) {
  // 从环境变量中获取用户名和密码
  // 如果环境变量未设置，则使用默认值
  const username = c.env.AUTH_USERNAME || 'admin'
  const password = c.env.AUTH_PASSWORD || 'admin'

  // 白名单路径，这些路径不需要身份验证
  // 包括：公共资源、健康检查、订阅链接、登录页面等
  const publicPaths: string[] = [
    '/health',
    '/favicon.ico',
    '/clash/', // 所有 clash 订阅链接都允许免验证访问
    '/login', // 登录页面
    '/403',   // 403错误页面
    '/404'    // 404错误页面
  ]
  if (c.req.path === '/') {
    return next()
  }

  // 检查请求路径是否在白名单中
  if (publicPaths.some(path => c.req.path.startsWith(path))) {
    return next()
  }

  // 获取 Authorization 请求头
  const authHeader = c.req.header('Authorization')

  // 如果没有提供 Authorization 头，返回 403 禁止访问的错误页面
  if (!authHeader || !authHeader.startsWith('Basic ')) {

    return c.html(
      <ErrorPage 
        statusCode={403}
        title="访问被拒绝"
        message="您需要登录才能访问此页面。请输入有效的用户名和密码。"
        backUrl="/login"
        backText="前往登录"
      />
    , 401,{
        'WWW-Authenticate': 'Basic realm="Secure Area"',
        'Content-Type': 'text/html; charset=utf-8'
    })
  }

  // 解析 Basic Auth 凭证
  try {
    // 移除 "Basic " 前缀并解码 base64 字符串
    const base64Credentials = authHeader.substring(6)
    const credentials = atob(base64Credentials)
    
    // 凭证格式为 "username:password"
    const [providedUsername, providedPassword] = credentials.split(':')

    // 验证用户名和密码
    if (providedUsername === username && providedPassword === password) {
      // 身份验证成功，继续到下一个中间件或路由处理程序
      return next()
    }
  } catch (error) {
    console.error('Basic Auth 解析错误:', error)
  }

  // 身份验证失败，返回 403 禁止访问的错误页面
  return c.html(
    <ErrorPage 
      statusCode={403}
      title="认证失败"
      message="用户名或密码错误。请检查您的凭据并重试。"
      backUrl="/login"
      backText="重新登录"
    />
  , 401)
}

/**
 * 验证用户名和密码
 * 返回是否验证成功
 */
export async function verifyCredentials(c: Context<{ Bindings: Env }>, username: string, password: string): Promise<boolean> {
  // 从环境变量或 KV 存储中获取正确的用户名和密码
  const storedUsername = c.env.AUTH_USERNAME || 'admin'
  const storedPassword = c.env.AUTH_PASSWORD || 'admin'
  
  try {
    // 尝试从 KV 存储中获取用户名和密码
    const kvUsername = await c.env.CLASH_CONFIG_KV.get('AUTH_USERNAME')
    const kvPassword = await c.env.CLASH_CONFIG_KV.get('AUTH_PASSWORD')
    
    // 如果 KV 中有存储的用户名和密码，优先使用
    const correctUsername = kvUsername || storedUsername
    const correctPassword = kvPassword || storedPassword
    
    // 验证提供的用户名和密码是否正确
    return username === correctUsername && password === correctPassword
  } catch (error) {
    console.error('验证凭据出错:', error)
    // 出错时回退到环境变量中的用户名和密码
    return username === storedUsername && password === storedPassword
  }
}

/**
 * 更新认证凭据
 * 允许管理员更新用户名和密码
 */
export async function updateAuthCredentials(c: Context<{ Bindings: Env }>, username: string, password: string) {
  // 这个函数可以在需要时实现
  // 如果使用 KV 存储，可以将凭据保存到 KV 中
  // 如果使用环境变量，则需要更新环境变量（这通常需要重新部署）
  
  // 示例实现（假设使用 KV 存储）
  try {
    await c.env.CLASH_CONFIG_KV.put('AUTH_USERNAME', username)
    await c.env.CLASH_CONFIG_KV.put('AUTH_PASSWORD', password)
    return true
  } catch (error) {
    console.error('更新认证凭据出错:', error)
    return false
  }
}