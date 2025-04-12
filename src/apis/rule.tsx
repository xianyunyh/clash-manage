import { Context } from 'hono'
import { Env } from '../bindings'
import { Subscription, Rule } from './types'
import Layout from '../view/Layout'
import AddRuleForm from '../view/AddRuleForm'

// 添加规则页面
export async function getAddRuleHandler(c: Context<{ Bindings: Env }>) {
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
}

// 处理添加规则请求
export async function postAddRuleHandler(c: Context<{ Bindings: Env }>) {
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
}

// 删除规则确认页面
export async function getDeleteRuleHandler(c: Context<{ Bindings: Env }>) {
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
}

// 处理删除规则请求
export async function postDeleteRuleHandler(c: Context<{ Bindings: Env }>) {
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
}