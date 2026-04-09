import axios from 'axios';
const BASE_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const uploadImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(`${BASE_API_URL}/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 30000
    });

    return res.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};  


export default uploadImage;
