import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getGenomes = async () => {
  const url = `${API_BASE}/genomes`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useGenomes = () => {
  return useQuery({
    queryKey: ['genomes'],
    queryFn: () => getGenomes(),
  });
};


