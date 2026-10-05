const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const auth = localStorage.getItem('homiesAuth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      if (parsed.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    } catch {
      // Ignore JSON parse error
    }
  }
  return {};
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default apiRequest;
