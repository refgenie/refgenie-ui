import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getSummary = async () => {
  const url = `${API_BASE}/summary`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const useSummary = () => {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => getSummary(),
  });
};
