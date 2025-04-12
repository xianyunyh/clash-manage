import { Hono } from 'hono'
import Layout from './view/Layout'
import ChangePasswordForm from './view/ChangePassword'
import { Env } from './bindings'
import {getSubscriptionListHandler, postAddSubscriptionHandler, postDeleteSubscriptionHandler } from './apis/subscriptions'
import { basicAuth, updateAuthCredentials, verifyCredentials } from './middleware/auth'
import {
  Login as LoginPage, AddRuleForm, NodeList, NodeForm,AddSubscriptionForm,
  EditSubscriptionForm,
} from './view'
import { Node, Rule, Subscription } from './apis/types'
const app = new Hono<{ Bindings: Env }>()

// 应用 Basic Auth 中间件到所有路由
app.use('*', basicAuth)

// 将首页设置为登录页面
app.get('/', (c) => {
  return c.html(<LoginPage />)
})

// 处理登录请求
app.post('/login', async (c) => {
  try {
    const formData = await c.req.formData()
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()
    
    if (!username || !password) {
      return c.html(
        <LoginPage 
          message="请输入用户名和密码" 
          error={true}
        />
      )
    }
    
    // 验证用户名和密码
    const isValid = await verifyCredentials(c, username, password)
    
    if (isValid) {
      // 登录成功，设置 Basic Auth 头并重定向到订阅列表页面
      const credentials = btoa(`${username}:${password}`)
      return c.redirect('/subscriptions',301)
    } else {
      // 登录失败，显示错误信息
      return c.html(
        <LoginPage 
          message="用户名或密码错误" 
          error={true}
        />
      )
    }
  } catch (error) {
    console.error('登录处理出错:', error)
    return c.html(
      <LoginPage 
        message="登录处理发生错误，请稍后重试" 
        error={true}
      />
    )
  }
})

// 将原首页功能添加到仪表盘路由
app.get('/subscriptions', (c) => {
  return c.html(
    <Layout>
      <h1>Clash 订阅配置工具</h1>
      <p>这是一个用于二次处理 Clash 订阅规则的工具，可以帮助您：</p>
      <ul>
        <li>添加自定义节点</li>
        <li>增加自定义规则</li>
        <li>管理多个订阅源</li>
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/subscriptions"
          style={{
            display: 'inline-block',
            background: '#2196F3',
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          管理订阅
        </a>
        <a 
          href="/admin/change-password"
          style={{
            display: 'inline-block',
            background: '#ff9800',
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          修改密码
        </a>
      </div>
    </Layout>
  )
})

app.get('/subscription/add', (c) => {
  return c.html(
    <Layout>
      <AddSubscriptionForm />
    </Layout>
  )
})

// 处理订阅添加请求
app.post('/subscription/add', postAddSubscriptionHandler)

// 删除订阅页面和处理
app.get('/subscription/delete/:id', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    return c.html(
      <Layout>
        <h1>删除订阅</h1>
        <div style={{ marginBottom: '20px' }}>
          <p>您确定要删除以下订阅吗？此操作不可撤销。</p>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            <p><strong>订阅名称:</strong> {subData.name}</p>
            <p><strong>订阅链接:</strong> {subData.url}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <form method="post" action={`/subscription/delete/${id}`} style={{ flexGrow: 1 }}>
            <button 
              type="submit" 
              style={{ 
                background: '#f44336', 
                border: 'none', 
                color: 'white',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              确认删除
            </button>
          </form>
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }catch (error) {
    console.error('获取订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理删除订阅请求
app.post('/subscription/delete/:id', postDeleteSubscriptionHandler)

// 添加规则页面
app.get('/subscription/:id/rule/add', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    return c.html(<AddRuleForm subId={id} subName={subData.name} />)
  } catch (error) {
    console.error('获取订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理添加规则请求
app.post('/subscription/:id/rule/add', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    const formData = await c.req.formData()
    const ruleType = formData.get('ruleType')?.toString()
    const ruleContent = formData.get('ruleContent')?.toString()
    const rulePolicy = formData.get('rulePolicy')?.toString()
    
    if (!ruleType || !ruleContent || !rulePolicy) {
      return c.html(
        <AddRuleForm 
          subId={id} 
          subName={subData.name} 
          message="请填写所有必填字段" 
          error={true}
        />
      )
    }
    
    // 创建规则对象
    const newRule: Rule = {
      id: crypto.randomUUID(),
      type: ruleType,
      content: ruleContent,
      policy: rulePolicy,
      createdAt: new Date().toISOString()
    }
    
    // 添加规则到订阅中
    if (!subData.rules) {
      subData.rules = []
    }
    
    subData.rules.push(newRule)
    
    // 更新订阅数据
    await c.env.CLASH_SUBS.put(id, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          规则添加成功
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href={`/subscription/${id}/rule/add`} 
            style={{ 
              background: '#4CAF50',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续添加规则
          </a>
          <a 
            href="/subscriptions" 
            style={{ 
              background: '#2196F3',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回订阅列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('添加规则出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          添加规则时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理删除规则请求
app.get('/subscription/:subId/rule/delete/:ruleId', async (c) => {
  const subId = c.req.param('subId')
  const ruleId = c.req.param('ruleId')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 查找要删除的规则
    if (!subData.rules) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何规则
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const ruleToDelete = subData.rules.find(rule => rule.id === ruleId)
    
    if (!ruleToDelete) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的规则
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    return c.html(
      <Layout>
        <h1>删除规则</h1>
        <div style={{ marginBottom: '20px' }}>
          <p>您确定要删除以下规则吗？此操作不可撤销。</p>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            <p><strong>规则类型:</strong> {ruleToDelete.type}</p>
            <p><strong>规则内容:</strong> {ruleToDelete.content}</p>
            <p><strong>策略:</strong> {ruleToDelete.policy}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <form method="post" action={`/subscription/${subId}/rule/delete/${ruleId}`} style={{ flexGrow: 1 }}>
            <button 
              type="submit" 
              style={{ 
                background: '#f44336', 
                border: 'none', 
                color: 'white',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              确认删除
            </button>
          </form>
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
              flexGrow: 1
            }}
          >
            取消
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('获取规则信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取规则信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理删除规则请求
app.post('/subscription/:subId/rule/delete/:ruleId', async (c) => {
  const subId = c.req.param('subId')
  const ruleId = c.req.param('ruleId')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 删除规则
    if (!subData.rules) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何规则
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    subData.rules = subData.rules.filter(rule => rule.id !== ruleId)
    
    // 更新订阅数据
    await c.env.CLASH_SUBS.put(subId, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          规则已成功删除
        </div>
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
      </Layout>
    )
  } catch (error) {
    console.error('删除规则出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          删除规则时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理 Clash 订阅请求
app.get('/clash/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.text('订阅不存在或已被删除', 404)
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 获取原始订阅内容
    const response = await fetch(subData.url)
    if (!response.ok) {
      return c.text('获取原始订阅失败', 500)
    }
    
    // 获取订阅内容
    const originalConfig = await response.text()
    
    // 首先应用自定义规则
    let updatedConfig = applyCustomRules(originalConfig, subData.rules || [])
    
    // 然后添加自定义节点
    updatedConfig = applyCustomNodes(updatedConfig, subData.nodes || [])
    
    return c.text(updatedConfig, 200, {
      'Content-Type': 'text/yaml; charset=utf-8',
    })
  } catch (error) {
    console.error('处理订阅出错:', error)
    return c.text('处理订阅时发生错误', 500)
  }
})

// 编辑订阅页面
app.get('/subscription/:id/edit', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    return c.html(<EditSubscriptionForm 
      subId={id} 
      subName={subData.name} 
      subUrl={subData.url}
    />)
  } catch (error) {
    console.error('获取订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理编辑订阅请求
app.post('/subscription/:id/edit', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    const formData = await c.req.formData()
    const subUrl = formData.get('subUrl')?.toString()
    const name = formData.get('name')?.toString()
    
    if (!subUrl || !isValidUrl(subUrl)) {
      return c.html(
        <EditSubscriptionForm 
          subId={id} 
          subName={subData.name} 
          subUrl={subData.url} 
          message="请提供有效的订阅链接" 
          error={true}
        />
      )
    }
    
    if (!name) {
      return c.html(
        <EditSubscriptionForm 
          subId={id} 
          subName={subData.name} 
          subUrl={subData.url} 
          message="请提供订阅名称" 
          error={true}
        />
      )
    }
    
    // 更新订阅信息
    subData.url = subUrl
    subData.name = name
    
    // 保存到 KV
    await c.env.CLASH_SUBS.put(id, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          订阅信息已成功更新
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href={`/subscription/${id}/edit`} 
            style={{ 
              background: '#ffc107',
              border: 'none', 
              color: 'black',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续编辑
          </a>
          <a 
            href="/subscriptions" 
            style={{ 
              background: '#2196F3',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回订阅列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('更新订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          更新订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 节点列表页面
app.get('/subscription/:id/nodes', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    return c.html(<NodeList 
      subId={id} 
      subName={subData.name}
      nodes={subData.nodes || []}
    />)
  } catch (error) {
    console.error('获取节点列表出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点列表时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 添加节点页面
app.get('/subscription/:id/node/add', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    return c.html(<NodeForm subId={id} subName={subData.name} />)
  } catch (error) {
    console.error('获取订阅信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取订阅信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理添加节点请求
app.post('/subscription/:id/node/add', async (c) => {
  const id = c.req.param('id')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(id)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    const formData = await c.req.formData()
    
    // 获取基本字段
    const name = formData.get('name')?.toString()
    const type = formData.get('type')?.toString()
    const server = formData.get('server')?.toString()
    const portStr = formData.get('port')?.toString()
    
    // 验证必填字段
    if (!name || !type || !server || !portStr) {
      return c.html(
        <NodeForm 
          subId={id} 
          subName={subData.name} 
          message="请填写所有必填字段" 
          error={true}
        />
      )
    }
    
    const port = parseInt(portStr)
    if (isNaN(port) || port < 1 || port > 65535) {
      return c.html(
        <NodeForm 
          subId={id} 
          subName={subData.name} 
          message="端口必须是1-65535之间的有效数字" 
          error={true}
        />
      )
    }
    
    // 获取可选字段
    const password = formData.get('password')?.toString() || ''
    const uuid = formData.get('uuid')?.toString() || ''
    const cipher = formData.get('cipher')?.toString() || ''
    const tls = formData.get('tls') !== null
    const skip_cert_verify = formData.get('skip_cert_verify') !== null
    const servername = formData.get('servername')?.toString() || ''
    const network = formData.get('network')?.toString() || ''
    const ws_path = formData.get('ws_path')?.toString() || ''
    const udp = formData.get('udp') !== null
    const grpc_service_name = formData.get('grpc_service_name')?.toString() || ''
    
    // 创建节点对象
    const newNode: Node = {
      id: crypto.randomUUID(),
      name,
      type,
      server,
      port,
      password,
      uuid,
      cipher,
      tls,
      skip_cert_verify,
      servername,
      network,
      ws_path,
      udp,
      grpc_service_name,
      createdAt: new Date().toISOString()
    }
    
    // 添加节点到订阅
    if (!subData.nodes) {
      subData.nodes = []
    }
    
    subData.nodes.push(newNode)
    
    // 更新订阅数据
    await c.env.CLASH_SUBS.put(id, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点添加成功
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href={`/subscription/${id}/node/add`} 
            style={{ 
              background: '#4CAF50',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续添加节点
          </a>
          <a 
            href={`/subscription/${id}/nodes`} 
            style={{ 
              background: '#2196F3',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回节点列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('添加节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          添加节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 编辑节点页面
app.get('/subscription/:subId/node/:nodeId/edit', async (c) => {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')
  
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 查找要编辑的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    const nodeToEdit = subData.nodes.find(node => node.id === nodeId)
    
    if (!nodeToEdit) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    return c.html(
      <NodeForm 
        subId={subId} 
        subName={subData.name}
        isEdit={true}
        nodeId={nodeId}
        initialValues={nodeToEdit}
      />
    )
  } catch (error) {
    console.error('获取节点信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理编辑节点请求
app.post('/subscription/:subId/node/:nodeId/edit', async (c) => {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')
  
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 查找要编辑的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    const nodeIndex = subData.nodes.findIndex(node => node.id === nodeId)
    
    if (nodeIndex === -1) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    const formData = await c.req.formData()
    
    // 获取基本字段
    const name = formData.get('name')?.toString()
    const type = formData.get('type')?.toString()
    const server = formData.get('server')?.toString()
    const portStr = formData.get('port')?.toString()
    
    // 验证必填字段
    if (!name || !type || !server || !portStr) {
      return c.html(
        <NodeForm 
          subId={subId} 
          subName={subData.name} 
          isEdit={true}
          nodeId={nodeId}
          initialValues={subData.nodes[nodeIndex]}
          message="请填写所有必填字段" 
          error={true}
        />
      )
    }
    
    const port = parseInt(portStr)
    if (isNaN(port) || port < 1 || port > 65535) {
      return c.html(
        <NodeForm 
          subId={subId} 
          subName={subData.name} 
          isEdit={true}
          nodeId={nodeId}
          initialValues={subData.nodes[nodeIndex]}
          message="端口必须是1-65535之间的有效数字" 
          error={true}
        />
      )
    }
    
    // 获取可选字段
    const password = formData.get('password')?.toString() || ''
    const uuid = formData.get('uuid')?.toString() || ''
    const cipher = formData.get('cipher')?.toString() || ''
    const tls = formData.get('tls') !== null
    const skip_cert_verify = formData.get('skip_cert_verify') !== null
    const servername = formData.get('servername')?.toString() || ''
    const network = formData.get('network')?.toString() || ''
    const ws_path = formData.get('ws_path')?.toString() || ''
    const udp = formData.get('udp') !== null
    const grpc_service_name = formData.get('grpc_service_name')?.toString() || ''
    
    // 更新节点对象
    const updatedNode: Node = {
      ...subData.nodes[nodeIndex],
      name,
      type,
      server,
      port,
      password,
      uuid,
      cipher,
      tls,
      skip_cert_verify,
      servername,
      network,
      ws_path,
      udp,
      grpc_service_name
    }
    
    // 更新节点数组
    subData.nodes[nodeIndex] = updatedNode
    
    // 更新订阅数据
    await c.env.CLASH_SUBS.put(subId, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点更新成功
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href={`/subscription/${subId}/node/${nodeId}/edit`} 
            style={{ 
              background: '#ffc107',
              border: 'none', 
              color: 'black',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            继续编辑
          </a>
          <a 
            href={`/subscription/${subId}/nodes`} 
            style={{ 
              background: '#2196F3',
              border: 'none', 
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            返回节点列表
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('更新节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          更新节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 删除节点页面
app.get('/subscription/:subId/node/:nodeId/delete', async (c) => {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')
  
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 查找要删除的节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    const nodeToDelete = subData.nodes.find(node => node.id === nodeId)
    
    if (!nodeToDelete) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            未找到指定的节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    return c.html(
      <Layout>
        <h1>删除节点</h1>
        <div style={{ marginBottom: '20px' }}>
          <p>您确定要删除以下节点吗？此操作不可撤销。</p>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            <p><strong>节点名称:</strong> {nodeToDelete.name}</p>
            <p><strong>节点类型:</strong> {nodeToDelete.type}</p>
            <p><strong>服务器地址:</strong> {nodeToDelete.server}</p>
            <p><strong>端口:</strong> {nodeToDelete.port}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <form method="post" action={`/subscription/${subId}/node/${nodeId}/delete`} style={{ flexGrow: 1 }}>
            <button 
              type="submit" 
              style={{ 
                background: '#f44336', 
                border: 'none', 
                color: 'white',
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              确认删除
            </button>
          </form>
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
              flexGrow: 1
            }}
          >
            取消
          </a>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('获取节点信息出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          获取节点信息时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 处理删除节点请求
app.post('/subscription/:subId/node/:nodeId/delete', async (c) => {
  const subId = c.req.param('subId')
  const nodeId = c.req.param('nodeId')
  
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_SUBS.get(subId)
    
    if (!subscription) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            订阅不存在或已被删除
          </div>
          <a href="/subscriptions">返回订阅列表</a>
        </Layout>
      )
    }
    
    const subData = JSON.parse(subscription) as Subscription
    
    // 删除节点
    if (!subData.nodes) {
      return c.html(
        <Layout>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            此订阅没有任何节点
          </div>
          <a href={`/subscription/${subId}/nodes`}>返回节点列表</a>
        </Layout>
      )
    }
    
    subData.nodes = subData.nodes.filter(node => node.id !== nodeId)
    
    // 更新订阅数据
    await c.env.CLASH_SUBS.put(subId, JSON.stringify(subData))
    
    return c.html(
      <Layout>
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          节点已成功删除
        </div>
        <a 
          href={`/subscription/${subId}/nodes`} 
          style={{ 
            display: 'inline-block',
            background: '#2196F3', 
            color: 'white',
            padding: '10px 15px',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          返回节点列表
        </a>
      </Layout>
    )
  } catch (error) {
    console.error('删除节点出错:', error)
    return c.html(
      <Layout>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          删除节点时发生错误，请稍后重试
        </div>
        <a href="/subscriptions">返回订阅列表</a>
      </Layout>
    )
  }
})

// 修改密码页面
app.get('/admin/change-password', (c) => {
  return c.html(<ChangePasswordForm />)
})

// 处理修改密码请求
app.post('/admin/change-password', async (c) => {
  try {
    const formData = await c.req.formData()
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()
    const confirmPassword = formData.get('confirmPassword')?.toString()
    
    if (!username || !password || !confirmPassword) {
      return c.html(
        <ChangePasswordForm 
          message="请填写所有必填字段" 
          error={true}
        />
      )
    }
    
    if (password !== confirmPassword) {
      return c.html(
        <ChangePasswordForm 
          message="两次输入的密码不匹配" 
          error={true}
        />
      )
    }
    
    // 更新认证凭据
    const result = await updateAuthCredentials(c, username, password)
    
    if (result) {
      return c.html(
        <ChangePasswordForm 
          message="登录凭据已成功更新，下次登录时将使用新的用户名和密码" 
          success={true}
        />
      )
    } else {
      return c.html(
        <ChangePasswordForm 
          message="保存登录凭据时发生错误，请稍后重试" 
          error={true}
        />
      )
    }
  } catch (error) {
    console.error('更新认证凭据出错:', error)
    return c.html(
      <ChangePasswordForm 
        message="处理请求时发生错误，请稍后重试" 
        error={true}
      />
    )
  }
})

// 辅助函数：验证URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 辅助函数：应用自定义规则到配置中
function applyCustomRules(originalConfig: string, rules: Rule[]): string {
  if (rules.length === 0) return originalConfig
  
  // 简单的字符串处理方法，实际环境可能需要使用 YAML 解析库
  let config = originalConfig
  
  // 定位规则部分，找到 rules: 定义的位置
  const rulesIndex = config.indexOf('\nrules:')
  
  if (rulesIndex === -1) {
    // 如果没有找到规则部分，添加一个新的规则部分
    config += '\nrules:'
    
    // 添加自定义规则
    for (const rule of rules) {
      config += `\n  - ${rule.type},${rule.content},${rule.policy}`
    }
  } else {
    // 找到规则部分，在其中插入自定义规则
    let rulesEndIndex = rulesIndex + 7 // 'rules:' 的长度
    
    // 用户规则应该添加在开头（优先级更高）
    let rulesInsertPos = config.indexOf('\n', rulesEndIndex)
    if (rulesInsertPos === -1) rulesInsertPos = config.length
    
    let customRulesText = ''
    for (const rule of rules) {
      customRulesText += `\n  - ${rule.type},${rule.content},${rule.policy}`
    }
    
    config = 
      config.substring(0, rulesInsertPos) + 
      customRulesText + 
      config.substring(rulesInsertPos)
  }
  
  return config
}

// 辅助函数：应用自定义节点到配置中
function applyCustomNodes(originalConfig: string, nodes: Node[]): string {
  if (nodes.length === 0) return originalConfig
  
  // 简单的字符串处理方法，实际环境可能需要使用 YAML 解析库
  let config = originalConfig
  
  // 定位节点部分，找到 proxies: 定义的位置
  const proxiesIndex = config.indexOf('\nproxies:')
  
  if (proxiesIndex === -1) {
    // 如果没有找到节点部分，添加一个新的节点部分
    config += '\nproxies:'
    
    // 添加自定义节点
    for (const node of nodes) {
      config += `\n  - name: ${node.name}`
      config += `\n    type: ${node.type}`
      config += `\n    server: ${node.server}`
      config += `\n    port: ${node.port}`
      if (node.password) config += `\n    password: ${node.password}`
      if (node.uuid) config += `\n    uuid: ${node.uuid}`
      if (node.cipher) config += `\n    cipher: ${node.cipher}`
      if (node.tls) config += `\n    tls: ${node.tls}`
      if (node.skip_cert_verify) config += `\n    skip-cert-verify: ${node.skip_cert_verify}`
      if (node.servername) config += `\n    servername: ${node.servername}`
      if (node.network) config += `\n    network: ${node.network}`
      if (node.ws_path) config += `\n    ws-path: ${node.ws_path}`
      if (node.udp) config += `\n    udp: ${node.udp}`
      if (node.grpc_service_name) config += `\n    grpc-service-name: ${node.grpc_service_name}`
    }
  } else {
    // 找到节点部分，在其中插入自定义节点
    let proxiesEndIndex = proxiesIndex + 9 // 'proxies:' 的长度
    
    // 用户节点应该添加在开头（优先级更高）
    let proxiesInsertPos = config.indexOf('\n', proxiesEndIndex)
    if (proxiesInsertPos === -1) proxiesInsertPos = config.length
    
    let customNodesText = ''
    for (const node of nodes) {
      customNodesText += `\n  - name: ${node.name}`
      customNodesText += `\n    type: ${node.type}`
      customNodesText += `\n    server: ${node.server}`
      customNodesText += `\n    port: ${node.port}`
      if (node.password) customNodesText += `\n    password: ${node.password}`
      if (node.uuid) customNodesText += `\n    uuid: ${node.uuid}`
      if (node.cipher) customNodesText += `\n    cipher: ${node.cipher}`
      if (node.tls) customNodesText += `\n    tls: ${node.tls}`
      if (node.skip_cert_verify) customNodesText += `\n    skip-cert-verify: ${node.skip_cert_verify}`
      if (node.servername) customNodesText += `\n    servername: ${node.servername}`
      if (node.network) customNodesText += `\n    network: ${node.network}`
      if (node.ws_path) customNodesText += `\n    ws-path: ${node.ws_path}`
      if (node.udp) customNodesText += `\n    udp: ${node.udp}`
      if (node.grpc_service_name) customNodesText += `\n    grpc-service-name: ${node.grpc_service_name}`
    }
    
    config = 
      config.substring(0, proxiesInsertPos) + 
      customNodesText + 
      config.substring(proxiesInsertPos)
  }
  
  return config
}

export default app
