// options.js - FocusTube options page

let currentSettings = {};

const CATEGORIES = [
  { name: 'brainrot', settingsKey: 'brainrotKeywords', listId: 'brainrot-keyword-list', inputId: 'brainrot-keyword-input', addBtnId: 'add-brainrot-keyword', statKeys: ['brainrotHidden'] },
  { name: 'ai', settingsKey: 'aiGeneratedKeywords', listId: 'ai-keyword-list', inputId: 'ai-keyword-input', addBtnId: 'add-ai-keyword', statKeys: ['aiGeneratedHidden'] },
  { name: 'greenscreen', settingsKey: 'greenScreenKeywords', listId: 'greenscreen-keyword-list', inputId: 'greenscreen-keyword-input', addBtnId: 'add-greenscreen-keyword', statKeys: ['greenScreenHidden'] }
];

const FILTER_TOGGLE_MAP = {
  'filter-brainrot': 'hideBrainrot',
  'filter-ai': 'hideAIGenerated',
  'filter-greenscreen': 'hideGreenScreen'
};

function initOptionsPage() {
  loadSettings();
  setupNavigation();
  setupEventListeners();
}

function loadSettings() {
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
    if (!response) return;
    currentSettings = response;
    updateUIWithSettings();
    updateStats();
  });
}

function setChecked(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(value);
}

function updateUIWithSettings() {
  setChecked('filter-brainrot', currentSettings.hideBrainrot);
  setChecked('filter-ai', currentSettings.hideAIGenerated);
  setChecked('filter-greenscreen', currentSettings.hideGreenScreen);

  CATEGORIES.forEach(cat => renderKeywordList(cat));
  renderChannelList();
}

function renderKeywordList(cat) {
  const list = document.getElementById(cat.listId);
  if (!list) return;
  list.innerHTML = '';

  const keywords = currentSettings[cat.settingsKey] || [];

  keywords.forEach(keyword => {
    const item = document.createElement('div');
    item.className = 'keyword-item';

    const name = document.createElement('span');
    name.className = 'keyword-name';
    name.textContent = keyword;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'keyword-delete';
    deleteBtn.textContent = 'Remove';
    deleteBtn.dataset.category = cat.name;
    deleteBtn.dataset.keyword = keyword;

    item.appendChild(name);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });
}

function renderChannelList() {
  const list = document.getElementById('blocked-channel-list');
  if (!list) return;
  list.innerHTML = '';

  const channels = currentSettings.blockedChannels || [];

  channels.forEach(channel => {
    const item = document.createElement('div');
    item.className = 'channel-item';

    const info = document.createElement('div');
    info.className = 'channel-info';

    const name = document.createElement('span');
    name.className = 'channel-name';
    name.textContent = channel.name || channel.id;

    const date = document.createElement('span');
    date.className = 'channel-date';
    date.textContent = channel.dateAdded
      ? `Blocked on ${new Date(channel.dateAdded).toLocaleDateString()}`
      : '';

    info.appendChild(name);
    info.appendChild(date);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'channel-delete';
    deleteBtn.textContent = 'Remove';
    deleteBtn.dataset.channelId = channel.id;

    item.appendChild(info);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.settings-section').forEach(el => {
        el.classList.remove('active');
      });

      document.getElementById(`${section}-section`).classList.add('active');
    });
  });
}

function setupEventListeners() {
  CATEGORIES.forEach(cat => {
    document.getElementById(cat.addBtnId).addEventListener('click', () => addKeyword(cat));
    document.getElementById(cat.inputId).addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addKeyword(cat);
    });
  });

  document.querySelectorAll('.keyword-list').forEach(list => {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.keyword-delete');
      if (!btn) return;
      removeKeyword(btn.dataset.category, btn.dataset.keyword);
    });
  });

  document.getElementById('add-channel-btn').addEventListener('click', addChannel);

  document.getElementById('blocked-channel-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.channel-delete');
    if (!btn) return;
    removeChannel(btn.dataset.channelId);
  });

  document.getElementById('channel-search').addEventListener('input', (e) => {
    filterChannelList(e.target.value);
  });

  document.getElementById('reset-stats-btn').addEventListener('click', resetStatistics);

  document.querySelectorAll('.toggle-switch input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const setting = FILTER_TOGGLE_MAP[e.target.id];
      if (!setting) return;
      updateSetting(setting, e.target.checked);
    });
  });
}

function addKeyword(cat) {
  const input = document.getElementById(cat.inputId);
  const keyword = input.value.trim();

  if (!keyword) return;

  chrome.runtime.sendMessage({
    type: 'ADD_KEYWORD',
    category: cat.name,
    keyword
  }, (response) => {
    if (response && response.success) {
      loadSettings();
      input.value = '';
    } else {
      alert(response && response.error ? response.error : 'Could not add keyword');
    }
  });
}

function removeKeyword(category, keyword) {
  chrome.runtime.sendMessage({
    type: 'REMOVE_KEYWORD',
    category,
    keyword
  }, () => {
    loadSettings();
  });
}

function addChannel() {
  const id = document.getElementById('new-channel-id').value.trim();
  const name = document.getElementById('new-channel-name').value.trim();

  if (!id || !name) {
    alert('Please fill in both Channel ID and Channel Name');
    return;
  }

  chrome.runtime.sendMessage({
    type: 'ADD_BLOCKED_CHANNEL',
    channelId: id,
    channelName: name
  }, (response) => {
    if (response && response.success) {
      loadSettings();
      document.getElementById('new-channel-id').value = '';
      document.getElementById('new-channel-name').value = '';
    } else {
      alert(response && response.error ? response.error : 'Could not add channel');
    }
  });
}

function removeChannel(channelId) {
  chrome.runtime.sendMessage({
    type: 'REMOVE_BLOCKED_CHANNEL',
    channelId
  }, () => {
    loadSettings();
  });
}

function filterChannelList(searchTerm) {
  const items = document.querySelectorAll('#blocked-channel-list .channel-item');

  items.forEach(item => {
    const channelName = item.querySelector('.channel-name').textContent.toLowerCase();
    const matches = channelName.includes(searchTerm.toLowerCase());
    item.style.display = matches ? 'flex' : 'none';
  });
}

function updateSetting(setting, value) {
  currentSettings[setting] = value;

  chrome.runtime.sendMessage({
    type: 'SAVE_SETTINGS',
    settings: currentSettings
  });
}

function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStartDate();
  const stats = currentSettings.statistics || {};
  const daily = stats.daily || {};
  const weekly = stats.weekly || {};
  const todayStats = daily[today] || {};
  const weekStats = weekly[weekStart] || {};

  document.getElementById('today-brainrot-hidden').textContent = todayStats.brainrotHidden || 0;
  document.getElementById('today-ai-hidden').textContent = todayStats.aiGeneratedHidden || 0;
  document.getElementById('today-greenscreen-hidden').textContent = todayStats.greenScreenHidden || 0;
  document.getElementById('today-channels-blocked').textContent = todayStats.channelsBlocked || 0;

  document.getElementById('week-brainrot-hidden').textContent = weekStats.brainrotHidden || 0;
  document.getElementById('week-ai-hidden').textContent = weekStats.aiGeneratedHidden || 0;
  document.getElementById('week-greenscreen-hidden').textContent = weekStats.greenScreenHidden || 0;
  document.getElementById('week-channels-blocked').textContent = weekStats.channelsBlocked || 0;
}

function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

function resetStatistics() {
  if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
    chrome.runtime.sendMessage({ type: 'RESET_STATISTICS' }, (response) => {
      if (response && response.success) {
        loadSettings();
      }
    });
  }
}

window.addEventListener('load', initOptionsPage);
