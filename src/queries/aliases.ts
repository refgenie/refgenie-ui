import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || '';


export const getAliases = async (name?: string, genomeDigest?: string) => {
  const url = `${API_BASE}/aliases`;

  const params: any = {};
  if (name) params.name = name;
  if (genomeDigest) params.genome_digest = genomeDigest;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAliases = (name?: string, genomeDigest?: string) => {
  return useQuery({
    queryKey: ['aliases', name, genomeDigest],
    queryFn: () => getAliases(name, genomeDigest),
  });
};
