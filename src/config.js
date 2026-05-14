const API_URL = process.env.REACT_APP_API_URL;
console.log({ API_URL });

export default {
  API_URL,
  modelsUrl: (filename) => `${API_URL}/models/${filename}`,
  apiUrl: (path) => `${API_URL}/api${path}`,
};