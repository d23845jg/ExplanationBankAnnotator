import axios from 'axios'


export const getFact = ({ unique_id }) => 
  axios
    .get(`http://localhost:8080/curation?id=${unique_id}`)
    .then(response => response.data);

export const getAllGuidelines = () => 
  axios
    .get('http://localhost:8080/curation?type=guidelines')
    .then(response => response.data);

export const getAllStatements = () => 
  axios
    .get('http://localhost:8080/curation?type=statements')
    .then(response => response.data);

export const postGuidelines = ({ factData }) => 
  axios
    .post('http://localhost:8080/save?type=guidelines', { factData })
    .then(response => response.data);

export const postStatement = ({ factData }) => 
  axios
    .post('http://localhost:8080/save?type=statements', { factData })
    .then(response => response.data);