import { Context } from 'hono'
import { Env } from '../bindings'
import { Subscription, Rule, Node, ClashConfig } from './types'
import { applyCustomRules, extraRuleProvider, groupNodesByCountry } from '../utils';
import yaml from 'js-yaml'

export async function generateConfig(c: Context<{ Bindings: Env }>) {
  const id = c.req.param('id')
  const auto = !!c.req.query('auto')
  const extend = !!c.req.query('extend')
  try {
    // 从 KV 中获取订阅信息
    const subscription = await c.env.CLASH_CONFIG_KV.get(id)

    if (!subscription) {
      return c.text('订阅不存在或已被删除', 404)
    }

    const subData = JSON.parse(subscription) as Subscription

    // 获取原始订阅内容
    const response = await fetch(subData.url)
    if (!response.ok) {
      return c.text('获取原始订阅失败', 500)
    }
    const headers = response.headers
    // 获取订阅内容
    const content = await response.text()
    let originalConfig = yaml.load(content) as ClashConfig
    if (auto) {
      // 然后按国家/地区对节点进行分组
      originalConfig["proxy-groups"] = groupNodesByCountry(originalConfig);
    }
    if (extend) {
      const { providers, rules } = extraRuleProvider();
      originalConfig["rules"] = rules;
      originalConfig["rule-providers"] = providers;
    }
    // 应用自定义规则
    let updatedConfig = applyCustomRules(originalConfig, subData.rules || [], subData.nodes || [])
    const resultText = yaml.dump(updatedConfig)
    return c.text(resultText, 200, {
      'Content-Type': 'text/yaml; charset=utf-8',
      "subscription-userinfo": headers.get('subscription-userinfo') || '',
    })
  } catch (error) {
    console.error('处理订阅出错:', error)
    return c.text('处理订阅时发生错误', 500)
  }
}