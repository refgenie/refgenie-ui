import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getGenome = async (api: ApiClient, genomeDigest?: string) => {
  const url = `${api.baseUrl}/genomes/${genomeDigest}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getGenomes = async (
  api: ApiClient,
  genomeDigest?: string,
  alias?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/genomes`;

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
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'genome', genomeDigest],
    queryFn: () => getGenome(api, genomeDigest),
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
  const api = useApiClient();
  return useQuery({
    queryKey: [
      api.baseUrl,
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
        api,
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
