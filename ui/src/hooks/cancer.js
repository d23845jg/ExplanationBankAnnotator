import useSWR from 'swr'

import {
  getMostCommonFacts,
  getTrainSearchSystemModel
} from '../api/cancer';

export function useCancerQuery(query) {

  const { data, error } = useSWR(`CANCER_CACHE_KEY:${query}`, async () => await getMostCommonFacts(query));

  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}

export async function getTrainSearchSystem() {
  await getTrainSearchSystemModel();
}