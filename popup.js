// 获取DOM元素
const siteInput = document.getElementById('siteInput');
const addSiteBtn = document.getElementById('addSite');
const siteList = document.getElementById('siteList');

// 从存储中加载网站列表
function loadSites() {
  chrome.storage.sync.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || [];
    siteList.innerHTML = '';
    sites.forEach(site => addSiteToList(site));
  });
}

// 将网站添加到列表中
function addSiteToList(site) {
  const div = document.createElement('div');
  div.className = 'site-item';
  
  // 创建带有密码查看功能的网站展示
  const maskedSite = site.replace(/./g, '*');
  div.innerHTML = `
    <div class="site-url-container">
      <span class="site-url" data-site="${site}">${maskedSite}</span>
      <button class="view-btn">查看</button>
    </div>
    <button class="delete-btn" data-site="${site}">删除</button>
  `;
  siteList.appendChild(div);

  // 添加查看按钮事件监听
  div.querySelector('.view-btn').addEventListener('click', function() {
    const siteSpan = div.querySelector('.site-url');
    const currentText = siteSpan.textContent;
    const originalSite = siteSpan.getAttribute('data-site');
    
    if (currentText === originalSite) {
      siteSpan.textContent = originalSite.replace(/./g, '*');
      this.textContent = '查看';
    } else {
      siteSpan.textContent = originalSite;
      this.textContent = '隐藏';
    }
  });

  // 添加删除按钮事件监听
  div.querySelector('.delete-btn').addEventListener('click', function() {
    const siteToDelete = this.getAttribute('data-site');
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const sites = result.blockedSites || [];
      const newSites = sites.filter(s => s !== siteToDelete);
      chrome.storage.sync.set({ blockedSites: newSites }, function() {
        div.remove();
      });
    });
  });
}

// 验证URL格式是否正确
function isValidUrl(url) {
  // 移除协议前缀，因为用户可能只输入域名
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/.*)*\/?$/;
  return urlPattern.test(url);
}

// 显示错误提示
function showError(message) {
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  const error = document.createElement('div');
  error.className = 'error-message';
  error.style.color = '#f44336';
  error.style.fontSize = '12px';
  error.style.marginTop = '5px';
  error.textContent = message;
  
  const inputContainer = document.querySelector('.input-container');
  inputContainer.appendChild(error);

  // 3秒后自动消失
  setTimeout(() => {
    error.remove();
  }, 3000);
}

// 添加网站按钮点击事件
addSiteBtn.addEventListener('click', function() {
  const site = siteInput.value.trim();
  
  // 检查是否为空
  if (!site) {
    showError('请输入要拦截的网站域名');
    return;
  }

  // 检查URL格式
  if (!isValidUrl(site)) {
    showError('请输入正确的网站域名格式，例如: example.com');
    return;
  }

  chrome.storage.sync.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.sync.set({ blockedSites: sites }, function() {
        addSiteToList(site);
        siteInput.value = '';
      });
    } else {
      showError('该网站已在拦截列表中');
    }
  });
});

// 初始加载网站列表
document.addEventListener('DOMContentLoaded', loadSites);