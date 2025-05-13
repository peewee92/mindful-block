// 使用declarativeNetRequest API来实现网站拦截
chrome.storage.sync.get(['blockedSites'], function(result) {
  const blockedSites = result.blockedSites || [];
  console.log('当前被阻止的网站列表:', blockedSites);

  // 创建动态规则
  const rules = blockedSites.map((site, index) => {
    // 移除URL中的协议和路径，只保留域名部分
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return {
      id: 1000 + index, // 使用1000以上的ID避免与静态规则冲突
      priority: 2, // 比静态规则优先级高
      action: {
        type: 'redirect',
        redirect: {
          url: chrome.runtime.getURL('meditation.html')
        }
      },
      condition: {
        urlFilter: `||${cleanSite}`, // 使用||前缀匹配所有子域名
        resourceTypes: ['main_frame']
      }
    };
  });

  // 更新规则
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(rule => rule.id), // 移除旧规则
    addRules: rules // 添加新规则
  });
});

// 监听存储变化，动态更新规则
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync' && changes.blockedSites) {
    const newBlockedSites = changes.blockedSites.newValue || [];
    console.log('阻止列表已更新:', newBlockedSites);

    // 重新创建和更新规则
    const rules = newBlockedSites.map((site, index) => {
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      return {
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: chrome.runtime.getURL('meditation.html')
          }
        },
        condition: {
          urlFilter: cleanSite,
          resourceTypes: ['main_frame']
        }
      };
    });

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });
  }
});