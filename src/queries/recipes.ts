import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getRecipe = async (api: ApiClient, recipeID?: string) => {
  const url = `${api.baseUrl}/recipes/${recipeID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getRecipes = async (
  api: ApiClient,
  outputAssetClass?: string,
  name?: string,
  version?: string,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${api.baseUrl}/recipes`;

  const params: any = {};
  if (outputAssetClass) params.output_asset_class = outputAssetClass;
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

export const useRecipe = (recipeID?: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'recipe', recipeID],
    queryFn: () => getRecipe(api, recipeID),
  });
};

export const useRecipes = (
  outputAssetClass?: string,
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
      'recipes',
      outputAssetClass,
      name,
      version,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getRecipes(
        api,
        outputAssetClass,
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
