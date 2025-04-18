import { Hono } from 'hono'
import ErrorPage from './view/ErrorPage'
import { Env } from './bindings'
import {getDeleteSubscriptionView, getEditSubscriptionView, getSubscriptionListHandler, postAddSubscriptionHandler, postDeleteSubscriptionHandler, postEditSubscriptionHandler } from './apis/subscriptions'
import { basicAuth } from './middleware/auth'
import {
  AddSubscriptionForm,
  Layout,
} from './view'
import { addRuleView, deleteRuleView, postAddRuleHandler, postDeleteRuleHandler } from './apis/rule'
import { generateConfig } from './apis/config'
import { addNodeView, deleteNode, deleteNodeView, editNodeView, nodeListView, postAddNode, postEditNode } from './apis/node'
const app = new Hono<{ Bindings: Env }>()

// 应用 Basic Auth 中间件到所有路由
app.use('*', basicAuth)

// 403 禁止访问页面
app.get('/403', (c) => {
  return c.html(
    <ErrorPage 
      statusCode={403}
      title="访问被拒绝"
      message="很抱歉，您没有权限访问此页面。请确认您的登录凭据或联系管理员获取访问权限。"
    />
  )
})

// 404 页面未找到
app.get('/404', (c) => {
  return c.html(
    <ErrorPage 
      statusCode={404}
      title="页面未找到"
      message="很抱歉，您访问的页面不存在。请检查URL是否正确或返回首页。"
    />
  )
})

// 处理任意未匹配路由 (404)
app.notFound((c) => {
  return c.html(
    <ErrorPage 
      statusCode={404}
      title="页面未找到"
      message="很抱歉，您访问的页面不存在。请检查URL是否正确或返回首页。"
    />
  )
})

// 将原首页功能添加到仪表盘路由
app.get('/', (c) => c.redirect('/subscriptions', 301))
app.get('/subscriptions', getSubscriptionListHandler)

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
app.get('/subscription/delete/:id', getDeleteSubscriptionView)

// 处理删除订阅请求
app.post('/subscription/delete/:id', postDeleteSubscriptionHandler)

// 添加规则页面
app.get('/subscription/:id/rule/add', addRuleView)

// 处理添加规则请求
app.post('/subscription/:id/rule/add', postAddRuleHandler)

// 处理删除规则请求
app.get('/subscription/:subId/rule/delete/:ruleId', deleteRuleView)

// 处理删除规则请求
app.post('/subscription/:subId/rule/delete/:ruleId', postDeleteRuleHandler)

// 处理 Clash 订阅请求
app.get('/clash/:id', generateConfig)

// 编辑订阅页面
app.get('/subscription/:id/edit', getEditSubscriptionView)

// 处理编辑订阅请求
app.post('/subscription/:id/edit', postEditSubscriptionHandler)

// 节点列表页面
app.get('/subscription/:id/nodes', nodeListView)

// 添加节点页面
app.get('/subscription/:id/node/add', addNodeView)

// 处理添加节点请求
app.post('/subscription/:id/node/add', postAddNode)

// 编辑节点页面
app.get('/subscription/:subId/node/:nodeId/edit', editNodeView)

// 处理编辑节点请求
app.post('/subscription/:subId/node/:nodeId/edit', postEditNode)

// 删除节点页面
app.get('/subscription/:subId/node/:nodeId/delete', deleteNodeView)

// 处理删除节点请求
app.post('/subscription/:subId/node/:nodeId/delete', deleteNode)
export default {
  fetch: app.fetch
}
