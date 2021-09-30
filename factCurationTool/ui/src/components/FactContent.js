import React from 'react';
import { useLocation } from 'react-router-dom';

import { useGetFact } from '../hooks/factCuration';
import FlexibleTable from './FlexibleTable';

function FactContent() {

  const { search } = useLocation();
  const unique_id = search.match(/id=(.*)/)?.[1];

  const useGetFactById = () => useGetFact(unique_id);

  return (
    <FlexibleTable useGetAll={useGetFactById} />
  );
};

export default FactContent;
