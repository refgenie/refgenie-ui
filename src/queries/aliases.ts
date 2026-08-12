import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getAliases = async (
  api: ApiClient,
  name?: string,
  genomeDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/aliases`;

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
  const api = useApiClient();
  return useQuery({
    queryKey: [
      api.baseUrl,
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
        api,
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
