import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || '';


export const getGenome = async (genomeDigest?: string) => {
  const url = `${API_BASE}/genomes/${genomeDigest}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getGenomes = async (genomeDigest?: string) => {
  const url = `${API_BASE}/genomes`;
  
  const params: any = {};
  if (genomeDigest) params.digest = genomeDigest;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useGenome = (genomeDigest?: string) => {
  return useQuery({
    queryKey: ['genomes', genomeDigest],
    queryFn: () => getGenome(genomeDigest),
  });
};

export const useGenomes = (genomeDigest?: string) => {
  return useQuery({
    queryKey: ['genomes', genomeDigest],
    queryFn: () => getGenomes(genomeDigest),
  });
};
