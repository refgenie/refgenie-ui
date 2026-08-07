import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getArchives = async (
  digest?: string,
  assetDigest?: string,
  genomeDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${API_BASE}/archives`;

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

export const useArchives = (
  digest?: string,
  assetDigest?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: [
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
        digest,
        assetDigest,
        undefined,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};

export const useGenomeArchives = (genomeDigest?: string) => {
  return useQuery({
    queryKey: ['genomeArchives', genomeDigest],
    queryFn: () => getArchives(undefined, undefined, genomeDigest),
    enabled: !!genomeDigest,
  });
};
