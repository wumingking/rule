/**
 * Sub-Store 节点名精简脚本
 * 功能：中英识别 + 旗帜转换 + 免费节点识别 + 编号(1,2,3)
 */

function operator(proxies) {
  // 核心映射：[旗帜, 中文名, 英文关键词正则]
  const countryData = [
    // 亚洲
    ['🇭🇰', '香港', /香港|HongKong|HK/i],
    ['🇲🇴', '澳门', /澳门|Macau|MO/i],
    ['🇼🇸', '台湾', /台湾|Taiwan|TW|🇹🇼/i],
    ['🇯🇵', '日本', /日本|Japan|JP/i],
    ['🇰🇷', '韩国', /韩国|Korea|KR/i],
    ['🇸🇬', '新加坡', /新加坡|Singapore|SG/i],
    ['🇮🇳', '印度', /印度|India|IN/i],
    ['🇹🇭', '泰国', /泰国|Thailand|TH/i],
    ['🇦🇪', '迪拜', /迪拜|阿联酋|UAE|Dubai/i],
    
    // 欧洲
    ['🇬🇧', '英国', /英国|United Kingdom|Britain|UK/i],
    ['🇫🇷', '法国', /法国|France|FR/i],
    ['🇩🇪', '德国', /德国|Germany|DE/i],
    ['🇳🇱', '荷兰', /荷兰|Netherlands|NL/i],
    ['🇮🇹', '意大利', /意大利|Italy|IT/i],
    ['🇪🇸', '西班牙', /西班牙|Spain|ES/i],
    ['🇮🇪', '爱尔兰', /爱尔兰|Ireland|IE/i],
    ['🇺🇦', '乌克兰', /乌克兰|Ukraine|UA/i],
    ['🇷🇺', '俄罗斯', /俄罗斯|Russia|RU/i],
    ['🇹🇷', '土耳其', /土耳其|Turkey|TR/i],
    
    // 美洲/大洋洲/南极洲
    ['🇺🇸', '美国', /美国|United States|America|US/i],
    ['🇨🇦', '加拿大', /加拿大|Canada|CA/i],
    ['🇦🇺', '澳大利亚', /澳大利亚|Australia|AU/i],
    ['🇧🇷', '巴西', /巴西|Brazil|BR/i],
    ['🇦🇶', '南极洲', /南极洲|Antarctica|AQ/i] // 新增南极洲
  ]

  const rateRegex = /(\d+(\.\d+)?)\s*(?:x|×|倍)|(?:x|×)\s*(\d+(\.\d+)?)/i
  
  let processed = proxies.map(p => {
    let raw = p.name || ''
    
    // 1. 匹配国家
    let matched = null
    for (const [flag, zh, regex] of countryData) {
      if (regex.test(raw)) {
        matched = { flag, zh }
        break
      }
    }
    
    if (!matched) return null 

    // 2. 提取倍率
    let rate = 1
    // 如果包含“免费”，强制设定倍率为 0
    if (raw.includes('免费')) {
      rate = 0
    } else {
      const m = raw.match(rateRegex)
      if (m) {
        rate = parseFloat(m[1] || m[3])
      }
    }

    return {
      ...p,
      __base: `${matched.flag}${matched.zh}`,
      __rate: rate
    }
  }).filter(Boolean)

  // 3. 自动编号逻辑
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // 4. 组装最终名称并去空格
  return processed.map(p => {
    // 只要倍率不是 1（包括 0），就显示 xN
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
