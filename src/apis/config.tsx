import { Context } from 'hono'
import { Env } from '../bindings'
import { Subscription, Rule, Node } from './types'
import { applyCustomRules } from '../utils';
export async function generateConfig(c: Context<{ Bindings: Env }>) {
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
    let updatedConfig = applyCustomRules(originalConfig, subData.rules || [], subData.nodes || [])

    return c.text(updatedConfig, 200, {
      'Content-Type': 'text/yaml; charset=utf-8',
    })
  } catch (error) {
    console.error('处理订阅出错:', error)
    return c.text('处理订阅时发生错误', 500)
  }

}