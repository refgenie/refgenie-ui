import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getArchives = async () => {
  const url = `${API_BASE}/archives`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useArchives = () => {
  return useQuery({
    queryKey: ['archives'],
    queryFn: () => getArchives(),
  });
};


