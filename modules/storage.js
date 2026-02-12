export function safeSetJSON(key, value) {
  try {
    // avoid circulars and ensure JSON-serializable
    const str = JSON.stringify(value);
    localStorage.setItem(key, str);
    return true;
  } catch (e) {
    console.warn('safeSetJSON failed', e);
    return false;
  }
}

export function safeGetJSON(key) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    return JSON.parse(v);
  } catch (e) {
    console.warn('safeGetJSON failed', e);
    return null;
  }
}

// Debounced writer to minimize frequent writes
export function createDebouncedSaver(fn, wait = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        fn(...args);
      } catch (e) {
        console.warn('debounced save failed', e);
      }
      timer = null;
    }, wait);
  };
}