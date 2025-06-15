import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getAssets = async () => {
  const url = `${API_BASE}/assets`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => getAssets(),
  });
};


