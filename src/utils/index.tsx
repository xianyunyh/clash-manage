import { ClashConfig, Node, ProxyGroup, Rule, RuleProvider } from '../apis/types'
import yaml from 'js-yaml'

// 辅助函数：应用自定义规则到配置中
function applyCustomRules(originalConfig: ClashConfig, rules: Rule[], nodes: Node[]): ClashConfig {
  if (rules.length === 0) return originalConfig
  const originRules = originalConfig.rules || []
  const newRules = rules.map(rule => {
    return `${rule.type},${rule.content},${rule.policy}` // 规则格式化   
  })
  originalConfig.rules = [...newRules, ...originRules]
  return originalConfig
}

/**
 * 按国家/地区对节点进行分组，并添加到 proxy-groups 中
 * @param originalConfig 原始 Clash 配置
 * @param nodes 所有节点列表
 * @returns 更新后的 Clash 配置
 */
function groupNodesByCountry(originalConfig: ClashConfig): Array<ProxyGroup> {
  const nodes = originalConfig.proxies || []
  const nodeNames = nodes.map(node => node.name)
  // 常见国家/地区关键词映射（中英文对照）
  const countryKeywords: Record<string, string[]> = {
    '🇭🇰香港': ['香港', 'HK', 'Hong Kong', 'HongKong'],
    '🇨🇳台湾': ['台湾', 'TW', 'Taiwan'],
    '🇯🇵🇰🇷日韩': ['日本', 'JP', 'Japan', '韩国', '南韩', 'KR', 'Korea'],
    '🇸🇬新加坡': ['新加坡', 'SG', 'Singapore'],
    '🇺🇸美国': ['美国', 'US', 'USA', 'United States'],
    '🇪🇺欧洲': ['英国', 'UK', 'GB', 'Great Britain', 'United Kingdom', '德国', 'DE', 'Germany', '法国', 'FR', 'France'],
  }
  
  // 按国家/地区分组节点
  const countryGroups: Record<string, string[]> = {}
  const otherNodes: string[] = [] // 无法识别国家的节点
  // 遍历所有节点，进行分组
  nodes.forEach(node => {
    let matched = false
    
    // 检查节点名称中是否包含国家/地区关键词
    for (const [country, keywords] of Object.entries(countryKeywords)) {
      if (keywords.some(keyword => 
        node.name.toLowerCase().includes(keyword.toLowerCase())
      )) {
        if (!countryGroups[country]) {
          countryGroups[country] = []
        }
        countryGroups[country].push(node.name)
        matched = true
        break
      }
    }
    
    // 如果没有匹配到任何国家/地区，放入其他分组
    if (!matched) {
      otherNodes.push(node.name)
    }
  })
  const newGroups:Array<ProxyGroup> = [];  
  // 检查是否已存在 Auto 组，如果不存在则创建
  let autoGroupIndex = newGroups.findIndex(group => 
    typeof group === 'object' && group.name === 'Auto'
  )
  newGroups.push({
    name: 'Auto',
    type: 'url-test',
    url: 'http://www.gstatic.com/generate_204',
    interval: 300,
    proxies: []
  })
  autoGroupIndex = newGroups.length - 1
  // 添加按国家/地区分组的 proxy-groups
  for (const [country, nodeNames] of Object.entries(countryGroups)) {
    if (nodeNames.length === 0) continue // 如果没有节点，跳过
    // 如果该国家/地区有节点
    // 创建该国家/地区的组
    const countryGroup: ProxyGroup = {
      name: country,
      type: 'url-test',
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
      proxies: nodeNames
    }

    // 添加到 proxy-groups
    newGroups.push(countryGroup)

    // 将该国家/地区组添加到 Auto 组的选项中
    if (typeof newGroups[autoGroupIndex] === 'object') {
      (newGroups[autoGroupIndex] as any).proxies.push(country)
    }
  }
  
  // 如果有未分类节点，创建 Others 组
  if (otherNodes.length > 0) {
    newGroups.push({
      name: '其他节点',
      type: 'select',
      proxies: otherNodes
    })
    
    // 将 Others 组添加到 Auto 组
    if (typeof newGroups[autoGroupIndex] === 'object') {
      (newGroups[autoGroupIndex] as any).proxies.push('其他节点')
    }
  }
  // 创建一个包含所有国家/地区组和直接连接选项的选择组
  const selectGroup: ProxyGroup = {
    name: 'Proxy',
    type: 'select',
    proxies: ['Auto', 'DIRECT']
  }

  // 添加所有国家/地区组到选择组
  for (const country of Object.keys(countryGroups)) {
    if (countryGroups[country].length > 0) {
      (selectGroup.proxies as string[]).push(country)
    }
  }
  if (otherNodes.length > 0) {
    (selectGroup.proxies as string[]).push('其他节点')
  }
  selectGroup.proxies.push(...nodeNames)
  // 添加到 proxy-groups 的最前面
  newGroups.unshift(selectGroup)
  return newGroups
}
function extraRuleProvider(): {
  providers: Record<string, RuleProvider>
  rules: string[]
} {
  const providers: Record<string, RuleProvider> = {}
  providers['Adblock'] = {
    type: 'http',
    behavior: 'domain',
    path: './ruleset/adblock.yaml',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
    interval: 86400
  }
  providers['GFW'] = {
    type: 'http',
    behavior: 'domain',
    path: './ruleset/gfw.yaml',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
    interval: 86400
  }
  providers['Cncidr'] = {
    type: 'http',
    behavior: 'domain',
    path: './ruleset/cncidr.yaml',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
    interval: 86400
  }
  const ruleSets = [
    'DOMAIN-SUFFIX,local,DIRECT',

    "DOMAIN-SUFFIX,google.com,Proxy",
    "DOMAIN-SUFFIX,youtube.com,Proxy",
    "DOMAIN,clash.razord.top,DIRECT",
    'RULE-SET,Adblock,REJECT',
    'RULE-SET,Cncidr,DIRECT',
    'RULE-SET,GFW,Proxy',

    'DOMAIN-SUFFIX,local,DIRECT',
    'IP-CIDR,192.168.0.0/16,DIRECT',
    'IP-CIDR,10.0.0.0/8,DIRECT',
    'IP-CIDR,172.16.0.0/12,DIRECT',
    'IP-CIDR,127.0.0.0/8,DIRECT',
    'IP-CIDR,::1/128,DIRECT',

    "GEOIP,CN,DIRECT",
    "GEOIP,LAN,DIRECT",
    "MATCH,Proxy",
  ]
  return {
    providers,
    rules: ruleSets
  }
}

export {
  applyCustomRules,
  groupNodesByCountry,
  extraRuleProvider,
}