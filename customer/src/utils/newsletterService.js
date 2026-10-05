export const SUBSCRIBERS_KEY = 'homiesSubscribers';

export function validateEmail(email) {
  if (!email) return false;
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

export function subscribe(email) {
  if (!validateEmail(email)) throw new Error('Invalid email');
  const raw = window.localStorage.getItem(SUBSCRIBERS_KEY) || '[]';
  const list = JSON.parse(raw);
  const exists = list.find((s) => s.email === email.toLowerCase());
  if (exists) throw new Error('Already subscribed');
  const entry = { email: email.toLowerCase(), date: new Date().toISOString() };
  list.push(entry);
  window.localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(list));
  return entry;
}

export function getSubscribers() {
  return JSON.parse(window.localStorage.getItem(SUBSCRIBERS_KEY) || '[]');
}
