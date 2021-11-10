import useSWR from 'swr'

import { 
  getAllDefinitions,
  getAllGuidelines, 
  getAllStatements, 
  postGuidelines, 
  postStatement 
} from '../api/factCuration';


export function useGetAllDefinitions () {

  const { data, error } = useSWR('DEFINITIONS_CACHE_KEY', async () => await getAllDefinitions(), {
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

export function useGetAllGuidelines () {

  const { data, error } = useSWR('GUIDELINES_CACHE_KEY', async () => await getAllGuidelines(), {
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

export function useGetAllStatements () {

  const { data, error } = useSWR('STATEMENTS_CACHE_KEY', async () => await getAllStatements(), {
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

export async function postAGuidelines (factData) {
  await postGuidelines({factData});
}

export async function postAStatement (factData) {
  await postStatement({factData});
}