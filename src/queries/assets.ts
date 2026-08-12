import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getAsset = async (api: ApiClient, assetDigest?: string) => {
  const url = `${api.baseUrl}/assets/${assetDigest}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getAssets = async (
  api: ApiClient,
  name?: string,
  assetGroupName?: string,
  genomeDigest?: string,
  recipeName?: string,
  assetGroupID?: number,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/assets`;

  const params: any = {};
  if (name) params.name = name;
  if (assetGroupName) params.asset_group_name = assetGroupName;
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (recipeName) params.recipe_name = recipeName;
  if (assetGroupID) params.asset_group_id = assetGroupID;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const getAssetFiles = async (api: ApiClient, digest: string) => {
  const url = `${api.baseUrl}/assets/${digest}/files`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const useAsset = (assetDigest?: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'asset', assetDigest],
    queryFn: () => getAsset(api, assetDigest),
  });
};

export const useAssets = (
  name?: string,
  assetGroupName?: string,
  genomeDigest?: string,
  recipeName?: string,
  assetGroupID?: number,
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
      'assets',
      name,
      assetGroupName,
      genomeDigest,
      recipeName,
      assetGroupID,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getAssets(
        api,
        name,
        assetGroupName,
        genomeDigest,
        recipeName,
        assetGroupID,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};

export const useAssetFiles = (digest?: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'assetFiles', digest],
    queryFn: () => getAssetFiles(api, digest as string),
    enabled: !!digest,
  });
};
