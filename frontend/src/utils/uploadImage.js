import axios from 'axios';
import { BASE_API_URL } from './baseApiUrl';

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
