import axios from 'axios'

export const getAllFacts = () =>
  axios
    .get('http://localhost:8081/facts')
    .then(response => response.data);

export const postAllFacts = ({ factData }) =>
  axios
    .post('http://localhost:8081/save?type=explanationBank', factData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => response.data);

export const postFact = ({ factData }) =>
  axios
    .post('http://localhost:8081/save', { factData })
    .then(response => response.data);