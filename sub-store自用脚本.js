/**
 * Sub-Store 节点名精简脚本 (终极稳定性版本)
 * 解决：United States(美国)、United Kingdom(英国)、Antarctica(南极洲) 误识问题
 */

function operator(proxies) {
  // 1. 定义精准匹配规则 (优先级从上到下)
  const rules = [
    { flag: '🇺🇸', zh: '美国', reg: /United\s*States|America|美国|\bUS\b/i },
    { flag: '🇬🇧', zh: '英国', reg: /United\s*Kingdom|Britain|英国|\bUK\b/i },
    { flag: '🇦🇶', zh: '南极洲', reg: /Antarctica|南极洲|\bAQ\b/i },
    { flag: '🇭🇰', zh: '香港', reg: /HongKong|香港|\bHK\b/i },
    { flag: '🇲🇴', zh: '澳门', reg: /Macau|澳门|\bMO\b/i },
    { flag: '🇼🇸', zh: '台湾', reg: /Taiwan|台湾|\bTW\b|🇹🇼/i },
    { flag: '🇯🇵', zh: '日本', reg: /Japan|日本|\bJP\b/i },
    { flag: '🇰🇷', 'zh': '韩国', reg: /Korea|韩国|\bKR\b/i },
    { flag: '🇸🇬', 'zh': '新加坡', reg: /Singapore|新加坡|\bSG\b/i },
    { flag: '🇦🇪', 'zh': '迪拜', reg: /Dubai|迪拜|阿联酋|UAE/i },
    { flag: '🇫🇷', 'zh': '法国', reg: /France|法国|\bFR\b/i },
    { flag: '🇩🇪', 'zh': '德国', reg: /Germany|德国|\bDE\b/i },
    { flag: '🇳🇱', 'zh': '荷兰', reg: /Netherlands|荷兰|\bNL\b/i },
    { flag: '🇮🇪', 'zh': '爱尔兰', reg: /Ireland|爱尔兰|\bIE\b/i },
    { flag: '🇺🇦', 'zh': '乌克兰', reg: /Ukraine|乌克兰|\bUA\b/i },
    { flag: '🇷🇺', 'zh': '俄罗斯', reg: /Russia|俄罗斯|\bRU\b/i },
    { flag: '🇹🇷', 'zh': '土耳其', reg: /Turkey|土耳其|\bTR\b/i },
    { flag: '🇨🇦', 'zh': '加拿大', reg: /Canada|加拿大|\bCA\b/i },
    { flag: '🇦🇺', 'zh': '澳大利亚', reg: /Australia|澳大利亚|\bAU\b/i },
    { flag: '🇧🇷', 'zh': '巴西', reg: /Brazil|巴西|\bBR\b/i },
    // 意大利放在最后，并增加严格过滤，防止命中 United 或 Britain 里的 it/in
    { flag: '🇮🇹', 'zh': '意大利', reg: /Italy|意大利|(\s+IT\s+|^IT\s+|\s+IT$)/i },
    { flag: '🇪🇸', 'zh': '西班牙', reg: /Spain|西班牙|\bES\b/i }
  ]

  const rateRegex = /(\d+(\.\d+)?)\s*(?:x|×|倍)|(?:x|×)\s*(\d+(\.\d+)?)/i
  
  let processed = proxies.map(p => {
    let raw = (p.name || '')
    
    // --- 步骤 1: 国家匹配 ---
    let matched = null
    for (const rule of rules) {
      if (rule.reg.test(raw)) {
        matched = { flag: rule.flag, zh: rule.zh }
        break // 核心：一旦匹配到前面的规则，立即跳出循环，防止被后面的意大利、印度等误伤
      }
    }
    
    if (!matched) return null 

    // --- 步骤 2: 倍率处理 ---
    let rate = 1
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

  // --- 步骤 3: 自动编号 (1, 2, 3) ---
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // --- 步骤 4: 最终格式化 ---
  return processed.map(p => {
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
