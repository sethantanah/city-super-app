// localStore.js
import { LocalStorage } from 'node-localstorage';

const localStorage = new LocalStorage('./scratch'); // Directory for persistent storage

/**
 * Set a value in local storage
 * @param {string} key 
 * @param {string} value 
 */
export function setItem(key, value) {
  localStorage.setItem(key, value);
}

/**
 * Get a value from local storage
 * @param {string} key 
 * @returns {string|null}
 */
export function getItem(key) {
  return localStorage.getItem(key);
}

/**
 * Remove a specific key from local storage
 * @param {string} key 
 */
export function removeItem(key) {
  localStorage.removeItem(key);
}

/**
 * Clear all items in local storage
 */
export function clearStorage() {
  localStorage.clear();
}

/**
 * Set a JSON object in local storage
 * @param {string} key 
 * @param {Object} jsonObj 
 */
export function setJSON(key, jsonObj) {
  localStorage.setItem(key, JSON.stringify(jsonObj));
}

/**
 * Get a JSON object from local storage
 * @param {string} key 
 * @returns {Object|null}
 */
export function getJSON(key) {
  const value = localStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Error parsing JSON from key: ${key}`, e);
    return null;
  }
}
