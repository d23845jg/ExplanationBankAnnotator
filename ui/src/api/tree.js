import axios from 'axios'

export const fetcher = (treeData) =>
  axios
    .post('/ExplanationTreeAPI/tree', { treeData })
    .then(response => response.data);