// import axios from 'axios'

// export const getAllFacts = () =>
//   axios
//     .get('http://localhost:8081/facts')
//     .then(response => response.data);

// export const postAllFacts = ({ factData }) =>
//   axios
//     .post('http://localhost:8081/save?type=explanationBank', factData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });

// export const postFact = ({ factData }) =>
//   axios
//     .post('http://localhost:8081/save', { factData });

// export const deleteFact = ({ id }) =>
//   axios
//     .delete(`http://localhost:8081/delete?id=${id}`);

import axios from 'axios'


export const getAllFacts = () => 
  axios
    .get('/CurationTool/facts')
    .then(response => response.data);

export const postAllFacts = ({ factData }) =>
  axios
    .post('/CurationTool/save?type=explanationBank', factData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

export const postFact = ({ factData }) =>
  axios
    .post('/CurationTool/save', { factData });

export const deleteFact = ({ id }) =>
  axios
    .delete(`/CurationTool/delete?id=${id}`);