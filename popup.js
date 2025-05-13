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
  div.innerHTML = `
    <span>${site}</span>
    <button class="delete-btn" data-site="${site}">删除</button>
  `;
  siteList.appendChild(div);

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

// 添加网站按钮点击事件
addSiteBtn.addEventListener('click', function() {
  const site = siteInput.value.trim();
  if (!site) return;

  chrome.storage.sync.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.sync.set({ blockedSites: sites }, function() {
        addSiteToList(site);
        siteInput.value = '';
      });
    }
  });
});

// 初始加载网站列表
document.addEventListener('DOMContentLoaded', loadSites);