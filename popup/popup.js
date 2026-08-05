// popup.js - FocusTube popup

let currentSettings = {};

const TOGGLE_MAP = {
  'toggle-brainrot': 'hideBrainrot',
  'toggle-greenscreen': 'hideGreenScreen',
  'toggle-ai': 'hideAIGenerated'
};

function initPopup() {
  loadSettings();
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
  setChecked('toggle-brainrot', currentSettings.hideBrainrot);
  setChecked('toggle-greenscreen', currentSettings.hideGreenScreen);
  setChecked('toggle-ai', currentSettings.hideAIGenerated);
}

function setupEventListeners() {
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('reset-stats').addEventListener('click', resetStatistics);

  document.querySelectorAll('.toggle-switch input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const setting = TOGGLE_MAP[e.target.id];
      if (!setting) return;
      updateSetting(setting, e.target.checked);
    });
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
  const stats = currentSettings.statistics || {};
  const daily = stats.daily || {};
  const todayStats = daily[today] || {};

  document.getElementById('videos-hidden').textContent = todayStats.videosHidden || 0;
  document.getElementById('channels-blocked').textContent = todayStats.channelsBlocked || 0;
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

window.addEventListener('load', initPopup);
