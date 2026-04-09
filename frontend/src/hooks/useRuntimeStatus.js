import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../utils/baseApiUrl';

export const useRuntimeStatus = () => {
  const [runtimeStatus, setRuntimeStatus] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadStatus = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/api/status`, { timeout: 10000 });
        if (!ignore) {
          setRuntimeStatus(response.data);
        }
      } catch {
        if (!ignore) {
          setRuntimeStatus(null);
        }
      }
    };

    loadStatus();

    return () => {
      ignore = true;
    };
  }, []);

  return runtimeStatus;
};
