/**
 * Sub-Store 节点名精简脚本
 * 包含：英国、南极洲、免费识别、自动编号
 */

function operator(proxies) {
  const countryData = [
    // 优先处理：南极洲与欧美大国，防止缩写干扰
    ['🇦🇶', '南极洲', /南极洲|Antarctica|\bAQ\b/i],
    ['🇬🇧', '英国', /英国|United Kingdom|Britain|\bUK\b/i],
    ['🇺🇸', '美国', /美国|United States|America|\bUS\b/i],
    
    // 亚洲
    ['🇭🇰', '香港', /香港|HongKong|\bHK\b/i],
    ['🇲🇴', '澳门', /澳门|Macau|\bMO\b/i],
    ['🇼🇸', '台湾', /台湾|Taiwan|\bTW\b|🇹🇼/i],
    ['🇯🇵', '日本', /日本|Japan|\bJP\b/i],
    ['🇰🇷', '韩国', /韩国|Korea|\bKR\b/i],
    ['🇸🇬', '新加坡', /新加坡|Singapore|\bSG\b/i],
    ['🇦🇪', '迪拜', /迪拜|阿联酋|UAE|Dubai/i],
    ['🇮🇳', '印度', /印度|India|\bIN\b/i],
    ['🇹🇭', '泰国', /泰国|Thailand|\bTH\b/i],
    
    // 欧洲
    ['🇫🇷', '法国', /法国|France|\bFR\b/i],
    ['🇩🇪', '德国', /德国|Germany|\bDE\b/i],
    ['🇳🇱', '荷兰', /荷兰|Netherlands|\bNL\b/i],
    ['🇮🇹', '意大利', /意大利|Italy|\bIT\b/i], 
    ['🇪🇸', '西班牙', /西班牙|Spain|\bES\b/i],
    ['🇮🇪', '爱尔兰', /爱尔兰|Ireland|\bIE\b/i],
    ['🇺🇦', '乌克兰', /乌克兰|Ukraine|\bUA\b/i],
    ['🇷🇺', '俄罗斯', /俄罗斯|Russia|\bRU\b/i],
    ['🇹🇷', '土耳其', /土耳其|Turkey|\bTR\b/i],
    
    // 其他
    ['🇨🇦', '加拿大', /加拿大|Canada|\bCA\b/i],
    ['🇦🇺', '澳大利亚', /澳大利亚|Australia|\bAU\b/i],
    ['🇧🇷', '巴西', /巴西|Brazil|\bBR\b/i]
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
    // 识别“免费”关键词，设定为 x0
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

  // 3. 自动编号逻辑 (1, 2, 3...)
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // 4. 组装最终名称并彻底去除空格
  return processed.map(p => {
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
