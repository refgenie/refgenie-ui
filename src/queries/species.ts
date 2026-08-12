import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getSpeciesSummary = async (api: ApiClient) => {
  const url = `${api.baseUrl}/species/summary`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const useSpeciesSummary = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'species'],
    queryFn: () => getSpeciesSummary(api),
  });
};
