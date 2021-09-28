import useSWR from 'swr'

import { fetcher } from '../api/cancer';

export function useCancerQuery (query) {

  const { data, error } = useSWR(`CANCER_CACHE_KEY:${query}`, async () => await fetcher(query));
  
  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}