/**
 * Sub-Store 节点名精简脚本 (中英双语识别版)
 * 格式：国旗+中文国家名+数字编号+倍率
 */

function operator(proxies) {
  // 核心映射：[旗帜, 中文名, 英文关键词正则]
  const countryData = [
    ['🇭🇰', '香港', /香港|HongKong|HK/i],
    ['🇲🇴', '澳门', /澳门|Macau|MO/i],
    ['🇼🇸', '台湾', /台湾|Taiwan|TW|🇹🇼/i], // 自动转换 🇹🇼 为 🇼🇸
    ['🇯🇵', '日本', /日本|Japan|JP/i],
    ['🇰🇷', '韩国', /韩国|Korea|KR/i],
    ['🇸🇬', '新加坡', /新加坡|Singapore|SG/i],
    ['🇺🇸', '美国', /美国|United States|America|US/i],
    ['🇬🇧', '英国', /英国|United Kingdom|Britain|UK/i],
    ['🇫🇷', '法国', /法国|France|FR/i],
    ['🇩🇪', '德国', /德国|Germany|DE/i],
    ['🇳🇱', '荷兰', /荷兰|Netherlands|NL/i],
    ['🇮🇹', '意大利', /意大利|Italy|IT/i],
    ['🇪🇸', '西班牙', /西班牙|Spain|ES/i],
    ['🇨🇦', '加拿大', /加拿大|Canada|CA/i],
    ['🇦🇺', '澳大利亚', /澳大利亚|Australia|AU/i],
    ['🇧🇷', '巴西', /巴西|Brazil|BR/i],
    ['🇹🇷', '土耳其', /土耳其|Turkey|TR/i],
    ['🇷🇺', '俄罗斯', /俄罗斯|Russia|RU/i],
    ['🇮🇳', '印度', /印度|India|IN/i],
    ['🇹🇭', '泰国', /泰国|Thailand|TH/i],
    ['🇦🇪', '阿联酋', /阿联酋|UAE|Dubai/i]
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
    
    if (!matched) return null // 未匹配到国家则剔除

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

  // 3. 编号逻辑 (1, 2, 3...)
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // 4. 组装最终名称并去空格
  return processed.map(p => {
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
