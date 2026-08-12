import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getSummary = async (api: ApiClient) => {
  const url = `${api.baseUrl}/summary`;

  const { data } = await axios.get<any>(url);
  return data;
};

// /summary is server-only; the local browse view renders counts from
// /genomes instead (bridge plan B5), so this hook is never mounted against
// a local client. The key still carries the base URL for cache hygiene.
export const useSummary = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: [api.baseUrl, 'summary'],
    queryFn: () => getSummary(api),
  });
};
