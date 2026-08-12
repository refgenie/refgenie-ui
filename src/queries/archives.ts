import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { hasCapability, useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getArchives = async (
  api: ApiClient,
  digest?: string,
  assetDigest?: string,
  genomeDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/archives`;

  const params: any = {};
  if (digest) params.digest = digest;
  if (assetDigest) params.asset_digest = assetDigest;
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

// Archives are a server-only surface (`archives` capability): a local
// refgenie has none, so these queries stay disabled against it rather than
// 404ing — feature gating is by capability flag, never by mode sniffing.
export const useArchives = (
  digest?: string,
  assetDigest?: string,
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
      'archives',
      digest,
      assetDigest,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getArchives(
        api,
        digest,
        assetDigest,
        undefined,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
    enabled: hasCapability(api, 'archives'),
  });
};

export const useGenomeArchives = (genomeDigest?: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'genomeArchives', genomeDigest],
    queryFn: () => getArchives(api, undefined, undefined, genomeDigest),
    enabled: !!genomeDigest && hasCapability(api, 'archives'),
  });
};
