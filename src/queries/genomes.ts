import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getGenomes = async (digest?: string) => {
  const url = `${API_BASE}/genomes`;
  
  const params: any = {};
  if (digest) params.digest = digest;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useGenomes = (digest?: string) => {
  return useQuery({
    queryKey: ['genomes', digest],
    queryFn: () => getGenomes(digest),
  });
};
