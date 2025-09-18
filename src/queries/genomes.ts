import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getGenome = async (genomeDigest?: string) => {
  const url = `${API_BASE}/genomes/${genomeDigest}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getGenomes = async (
  genomeDigest?: string,
  alias?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${API_BASE}/genomes`;

  const params: any = {};
  if (genomeDigest) params.digest = genomeDigest;
  if (alias) params.alias = alias;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useGenome = (genomeDigest?: string) => {
  return useQuery({
    queryKey: ['genome', genomeDigest],
    queryFn: () => getGenome(genomeDigest),
  });
};

export const useGenomes = (
  genomeDigest?: string,
  alias?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: [
      'genomes',
      genomeDigest,
      alias,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getGenomes(
        genomeDigest,
        alias,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};
