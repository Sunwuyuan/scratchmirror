import axiosInstance from './axios.js';

async function fetchFromScratchAPI(path, query) {
  const baseUrl = "https://api.scratch.mit.edu/";
  const url = `${baseUrl}${path}?${new URLSearchParams(query).toString()}`;

  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

async function fetchFromProjectAPI(path, query) {
  const baseUrl = "https://projects.scratch.mit.edu/";
  const url = `${baseUrl}${path}?${new URLSearchParams(query).toString()}`;

  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export { fetchFromScratchAPI, fetchFromProjectAPI };
