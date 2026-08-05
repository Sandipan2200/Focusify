// Filter utilities for FocusTube

const FilterUtils = {
  isElementHidden(element) {
    return element.style.display === 'none';
  },

  shouldFilterElement(element, settings, filterType) {
    switch (filterType) {
      case 'shorts':
        return this.isShortsElement(element);
      case 'recommendations':
        return this.isRecommendationElement(element);
      case 'comments':
        return this.isCommentElement(element);
      case 'endCards':
        return this.isEndCardElement(element);
      case 'trending':
        return this.isTrendingElement(element);
      case 'live':
        return this.isLiveStreamElement(element);
      default:
        return false;
    }
  },

  isShortsElement(element) {
    return element.closest('.shorts, ytd-reel-item-renderer, ytd-rich-item-renderer[is-shorts="true"]') !== null ||
      element.matches('.shorts-button, .shorts-shelf, [role="tab"][href*="/shorts"]');
  },

  isRecommendationElement(element) {
    return element.closest('#secondary, ytd-rich-item-renderer, ytd-video-renderer[is-nudge-supported="true"], .ytd-compact-video-renderer, ytd-watch-next-pseudoslider-renderer, ytd-compact-link-renderer, .ytd-vertical-list-renderer') !== null;
  },

  isCommentElement(element) {
    return element.closest('#comments, ytd-comments, #comment') !== null;
  },

  isEndCardElement(element) {
    return element.closest('.ytp-endscreen, .ytp-endscreen-content') !== null ||
      element.matches('ytd-watch-next-pseudoslider-renderer');
  },

  isTrendingElement(element) {
    return element.closest('[href*="/trending"], ytd-trending-item-renderer, ytd-exploration-shelf-renderer, [href*="/browse"], ytd-browse') !== null;
  },

  isLiveStreamElement(element) {
    return element.closest('ytd-video-renderer[video-id][badge="LIVE"], ytd-rich-item-renderer[badge="LIVE"], paper-badge[aria-label="LIVE"]') !== null;
  },

  matchesKeyword(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  },

  extractChannelId(url) {
    if (!url) return null;
    const match = url.match(/channel\/([^/?&]+)/);
    if (match) return match[1];
    const match2 = url.match(/youtube\.com\/c\/([^/?&]+)/);
    if (match2) return match2[1];
    const match3 = url.match(/youtube\.com\/user\/([^/?&]+)/);
    if (match3) return match3[1];
    return null;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

window.FilterUtils = FilterUtils;