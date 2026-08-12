import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getAssetClass = async (api: ApiClient, assetClassID?: string) => {
  const url = `${api.baseUrl}/asset_classes/${assetClassID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getAssetClasses = async (
  api: ApiClient,
  name?: string,
  version?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/asset_classes`;

  const params: any = {};
  if (name) params.name = name;
  if (version) params.version = version;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAssetClass = (assetClassID?: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'assetClass', assetClassID],
    queryFn: () => getAssetClass(api, assetClassID),
  });
};

export const useAssetClasses = (
  name?: string,
  version?: string,
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
      'assetClasses',
      name,
      version,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getAssetClasses(
        api,
        name,
        version,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};
