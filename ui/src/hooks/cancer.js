import useSWR from 'swr'

import { getMostCommonFacts } from '../api/cancer';

export function useCancerQuery (query) {

  const { data, error } = useSWR(`CANCER_CACHE_KEY:${query}`, async () => await getMostCommonFacts(query));
  
  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}