import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getAliases = async (
  name?: string,
  genomeDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${API_BASE}/aliases`;

  const params: any = {};
  if (name) params.name = name;
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAliases = (
  name?: string,
  genomeDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: [
      'aliases',
      name,
      genomeDigest,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getAliases(
        name,
        genomeDigest,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};
