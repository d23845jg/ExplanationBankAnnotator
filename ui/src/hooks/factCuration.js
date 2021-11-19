import useSWR from 'swr'

import {
  getAllFacts,
  postAllFacts,
  postFact,
} from '../api/factCuration';


export function useGetAllFacts() {

  const { data, error } = useSWR('DEFINITIONS_CACHE_KEY', async () => await getAllFacts(), {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 1000
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}

export async function postAllExplanationBank(factData) {
  await postAllFacts({ factData });
}

export async function postAFact(factData) {
  await postFact({ factData });
}