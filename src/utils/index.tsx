import { ClashConfig, Node, Rule } from '../apis/types'
import yaml from 'js-yaml'
// 辅助函数：应用自定义规则到配置中
function applyCustomRules(originalConfig: string, rules: Rule[],nodes: Node[]): string {
  if (rules.length === 0) return originalConfig
  let config: ClashConfig = yaml.load(originalConfig) as ClashConfig
  const originRules = config.rules || []
  const newRules = rules.map(rule => {
    return `${rule.type},${rule.content},${rule.policy}` // 规则格式化   
  })
  config.rules = [...newRules, ...originRules]
  console.log('config', config)
  return yaml.dump(config)
}

export {
  applyCustomRules
}