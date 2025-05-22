// 使用declarativeNetRequest API来实现网站拦截
chrome.storage.sync.get(['blockedSites'], function(result) {
  const blockedSites = result.blockedSites || [];
  
  // 创建动态规则
  const rules = blockedSites.map((site, index) => ({
    id: index + 1000, // 使用1000以上的ID避免与静态规则冲突
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        url: chrome.runtime.getURL('meditation.html')
      }
    },
    condition: {
      urlFilter: site,
      resourceTypes: ['main_frame']
    }
  }));

  // 更新规则
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(rule => rule.id),
    addRules: rules
  });
});

// 监听存储变化，动态更新规则
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync' && changes.blockedSites) {
    const newBlockedSites = changes.blockedSites.newValue || [];
    
    const rules = newBlockedSites.map((site, index) => ({
      id: index + 1000,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: chrome.runtime.getURL('meditation.html')
        }
      },
      condition: {
        urlFilter: site,
        resourceTypes: ['main_frame']
      }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });
  }
});