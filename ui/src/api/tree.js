// import axios from 'axios'


// export const fetcher = (treeData) =>
//   axios
//     .post('http://localhost:8080/tree', { treeData })
//     .then(response => response.data);

import axios from 'axios'

export const fetcher = (treeData) =>
  axios
    .post('/ExplanationTreeAPI/tree', { treeData })
    .then(response => response.data);