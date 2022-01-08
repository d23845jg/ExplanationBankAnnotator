import useSWR from 'swr'

import {
  getAllFacts,
  postAllFacts,
  postFact,
  deleteFact,
} from '../api/factCuration';


export function useGetAllFacts() {

  const { data, error } = useSWR('DEFINITIONS_CACHE_KEY', async () => await getAllFacts(), {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 5000
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

export async function deleteAFact(id) {
  await deleteFact({ id });
}