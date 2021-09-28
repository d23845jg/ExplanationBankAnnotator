import useSWR from 'swr'

import { getAllGuidelines, getAllStatements } from '../api/factCuration';

export function useGetAllGuidelines () {

  const { data, error } = useSWR('GUIDELINES_CACHE_KEY', async () => await getAllGuidelines());
  
  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}

export function useGetAllStatements () {
  
  const { data, error } = useSWR('STATEMENTS_CACHE_KEY', async () => await getAllStatements());
  
  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}