import { safeSetJSON, safeGetJSON, createDebouncedSaver } from './storage.js';
import { sanitizeString } from './utils.js';
import { enqueueNotification, clearNotifications } from './notifier.js';

// Patch global storage functions used by the app to use safer wrappers
if (window) {
  // Replace saveToLocalStorage to use safeSetJSON and debounce to minimize IO
  if (typeof window.saveToLocalStorage === 'function') {
    const originalSave = window.saveToLocalStorage;
    const wrappedSave = () => {
      try {
        // gather app state in a controlled way
        const tx = Array.isArray(window.transactions) ? window.transactions : [];
        const prods = Array.isArray(window.products) ? window.products : [];
        safeSetJSON('accountingTransactions', tx);
        safeSetJSON('accountingProducts', prods);
      } catch (e) {
        console.warn('wrappedSave failed', e);
      }
    };
    // debounced version to avoid frequent synchronous writes
    window.saveToLocalStorage = createDebouncedSaver(wrappedSave, 300);
  } else {
    // define fallback
    window.saveToLocalStorage = createDebouncedSaver(() => {}, 300);
  }

  // Replace loadFromLocalStorage to use safeGetJSON and sanitize retrieved strings
  window.loadFromLocalStorage = function() {
    try {
      const saved = safeGetJSON('accountingTransactions');
      const savedProducts = safeGetJSON('accountingProducts');
      if (Array.isArray(saved)) {
        window.transactions = saved.map(t => {
          // sanitize common string fields
          if (t && typeof t === 'object') {
            t.type = sanitizeString(t.type || '');
            t.debitAccount = sanitizeString(t.debitAccount || '');
            t.creditAccount = sanitizeString(t.creditAccount || '');
            t.description = sanitizeString(t.description || '');
            // ensure numbers are numbers
            t.amount = Number(t.amount) || 0;
            return t;
          }
          return null;
        }).filter(Boolean);
      }
      if (Array.isArray(savedProducts)) {
        // sanitize product fields
        window.products = savedProducts.map(p => {
          if (p && typeof p === 'object') {
            return {
              id: sanitizeString(p.id || ''),
              name: sanitizeString(p.name || ''),
              price: Number(p.price) || 0,
              purchasePrice: Number(p.purchasePrice) || 0,
              stock: Number(p.stock) || 0,
              debitAccount: sanitizeString(p.debitAccount || ''),
              creditAccount: sanitizeString(p.creditAccount || '')
            };
          }
          return null;
        }).filter(Boolean);
      }
    } catch (e) {
      console.warn('loadFromLocalStorage patched failed', e);
    }
  };

  // Patch notification functions to use queuing/enqueue
  window.showNotification = function(message, durationMs = 3500) {
    try {
      const safeMsg = sanitizeString(message || '');
      enqueueNotification(safeMsg, durationMs);
    } catch (e) {
      console.warn('showNotification patch failed', e);
    }
  };

  window.hideNotification = function() {
    try {
      clearNotifications();
    } catch (e) {
      console.warn('hideNotification patch failed', e);
    }
  };

  // Harden edit operations: wrap functions that accept free text to sanitize inputs before use
  const sanitizeFormInputs = () => {
    // transaction form fields
    const desc = document.getElementById('description');
    if (desc) desc.addEventListener('blur', () => { desc.value = sanitizeString(desc.value, 512); });
    const companyName = document.getElementById('companyName');
    if (companyName) companyName.addEventListener('blur', () => { companyName.value = sanitizeString(companyName.value, 256); });
    // catalog form input
    const catalogInput = document.getElementById('catalogFormInput');
    if (catalogInput) catalogInput.addEventListener('blur', () => { catalogInput.value = sanitizeString(catalogInput.value, 512); });
  };

  // run initial sanitizers once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sanitizeFormInputs);
  } else {
    sanitizeFormInputs();
  }
}