/**
 * Sub-Store 节点名精简脚本 (多国中英识别版)
 * 功能：国旗 + 中文名 + 编号(1,2,3) + 倍率(xN)
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
    ['🇦🇪', '迪拜', /迪拜|阿联酋|UAE|Dubai/i], // 新增迪拜
    
    // 欧洲
    ['🇬🇧', '英国', /英国|United Kingdom|Britain|UK/i],
    ['🇫🇷', '法国', /法国|France|FR/i],
    ['🇩🇪', '德国', /德国|Germany|DE/i],
    ['🇳🇱', '荷兰', /荷兰|Netherlands|NL/i],
    ['🇮🇹', '意大利', /意大利|Italy|IT/i],
    ['🇪🇸', '西班牙', /西班牙|Spain|ES/i],
    ['🇮🇪', '爱尔兰', /爱尔兰|Ireland|IE/i], // 新增爱尔兰
    ['🇺🇦', '乌克兰', /乌克兰|Ukraine|UA/i],   // 新增乌克兰
    ['🇷🇺', '俄罗斯', /俄罗斯|Russia|RU/i],
    ['🇹🇷', '土耳其', /土耳其|Turkey|TR/i],
    
    // 美洲/大洋洲
    ['🇺🇸', '美国', /美国|United States|America|US/i],
    ['🇨🇦', '加拿大', /加拿大|Canada|CA/i],
    ['🇦🇺', '澳大利亚', /澳大利亚|Australia|AU/i],
    ['🇧🇷', '巴西', /巴西|Brazil|BR/i]
  ]

  const rateRegex = /(\d+(\.\d+)?)\s*(?:x|×|倍)|(?:x|×)\s*(\d+(\.\d+)?)/i
  
  let processed = proxies.map(p => {
    let raw = p.name || ''
    
    // 1. 匹配国家 (通过正则识别中英文及缩写)
    let matched = null
    for (const [flag, zh, regex] of countryData) {
      if (regex.test(raw)) {
        matched = { flag, zh }
        break
      }
    }
    
    if (!matched) return null // 未匹配到预设国家的节点将不显示

    // 2. 提取倍率
    let rate = 1
    const m = raw.match(rateRegex)
    if (m) {
      rate = parseFloat(m[1] || m[3])
    }

    return {
      ...p,
      __base: `${matched.flag}${matched.zh}`,
      __rate: rate
    }
  }).filter(Boolean)

  // 3. 自动编号逻辑 (1, 2, 3...)
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // 4. 组装最终名称：去空格，一倍不显示
  return processed.map(p => {
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
