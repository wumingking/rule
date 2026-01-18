/**
 * Sub-Store 节点名精简脚本 (高精度识别版)
 * 解决：Hong Kong(香港)、United States(美国)、United Kingdom(英国)、Antarctica(南极洲)
 */

function operator(proxies) {
  // 1. 优先级匹配表 (从上往下匹配，匹配到即停止)
  const rules = [
    // 绝对优先级：处理容易包含其它关键词的长英文名
    { flag: '🇭🇰', zh: '香港', reg: /Hong\s*Kong|香港|\bHK\b/i },
    { flag: '🇺🇸', zh: '美国', reg: /United\s*States|America|美国|\bUS\b/i },
    { flag: '🇬🇧', zh: '英国', reg: /United\s*Kingdom|Britain|英国|\bUK\b/i },
    { flag: '🇦🇶', zh: '南极洲', reg: /Antarctica|南极洲|\bAQ\b/i },
    
    // 亚洲地区
    { flag: '🇲🇴', zh: '澳门', reg: /Macau|澳门|\bMO\b/i },
    { flag: '🇼🇸', zh: '台湾', reg: /Taiwan|台湾|\bTW\b|🇹🇼/i },
    { flag: '🇯🇵', zh: '日本', reg: /Japan|日本|\bJP\b/i },
    { flag: '🇰🇷', zh: '韩国', reg: /Korea|韩国|\bKR\b/i },
    { flag: '🇸🇬', zh: '新加坡', reg: /Singapore|新加坡|\bSG\b/i },
    { flag: '🇦🇪', zh: '迪拜', reg: /Dubai|迪拜|阿联酋|UAE/i },
    { flag: '🇮🇳', zh: '印度', reg: /India|印度|\bIN\b/i },
    { flag: '🇹🇭', zh: '泰国', reg: /Thailand|泰国|\bTH\b/i },
    
    // 欧洲地区
    { flag: '🇫🇷', zh: '法国', reg: /France|法国|\bFR\b/i },
    { flag: '🇩🇪', zh: '德国', reg: /Germany|德国|\bDE\b/i },
    { flag: '🇳🇱', zh: '荷兰', reg: /Netherlands|荷兰|\bNL\b/i },
    { flag: '🇮🇪', zh: '爱尔兰', reg: /Ireland|爱尔兰|\bIE\b/i },
    { flag: '🇺🇦', zh: '乌克兰', reg: /Ukraine|乌克兰|\bUA\b/i },
    { flag: '🇷🇺', zh: '俄罗斯', reg: /Russia|俄罗斯|\bRU\b/i },
    { flag: '🇹🇷', zh: '土耳其', reg: /Turkey|土耳其|\bTR\b/i },
    { flag: '🇮🇹', zh: '意大利', reg: /Italy|意大利|(\s+IT\s+|^IT\s+|\s+IT$)/i }, // 严格匹配 IT
    { flag: '🇪🇸', zh: '西班牙', reg: /Spain|西班牙|\bES\b/i },
    
    // 其它
    { flag: '🇨🇦', zh: '加拿大', reg: /Canada|加拿大|\bCA\b/i },
    { flag: '🇦🇺', zh: '澳大利亚', reg: /Australia|澳大利亚|\bAU\b/i },
    { flag: '🇧🇷', zh: '巴西', reg: /Brazil|巴西|\bBR\b/i }
  ]

  const rateRegex = /(\d+(\.\d+)?)\s*(?:x|×|倍)|(?:x|×)\s*(\d+(\.\d+)?)/i
  
  let processed = proxies.map(p => {
    let raw = p.name || ''
    
    // --- 步骤 1: 匹配国家 ---
    let matched = null
    for (const rule of rules) {
      if (rule.reg.test(raw)) {
        matched = { flag: rule.flag, zh: rule.zh }
        break // 关键：一旦匹配成功立即跳出，不看后面的规则
      }
    }
    
    if (!matched) return null 

    // --- 步骤 2: 提取倍率 ---
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

  // --- 步骤 3: 编号逻辑 ---
  const countMap = {}
  processed.forEach(p => {
    const base = p.__base
    countMap[base] = (countMap[base] || 0) + 1
    p.__idx = countMap[base].toString()
  })

  // --- 步骤 4: 命名与去空格 ---
  return processed.map(p => {
    const rateStr = p.__rate !== 1 ? `x${p.__rate}` : ''
    p.name = `${p.__base}${p.__idx}${rateStr}`.replace(/\s+/g, '')
    
    delete p.__base
    delete p.__rate
    delete p.__idx
    return p
  })
}
