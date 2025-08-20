import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getSpeciesSummary = async () => {
  const url = `${API_BASE}/species/summary`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const useSpeciesSummary = () => {
  return useQuery({
    queryKey: ['species'],
    queryFn: () => getSpeciesSummary(),
  });
};
