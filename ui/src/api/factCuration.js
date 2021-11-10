import axios from 'axios'


export const getAllDefinitions = () => 
  axios
    .get('http://localhost:8081/curation?type=definitions')
    .then(response => response.data);

    export const getAllGuidelines = () => 
  axios
    .get('http://localhost:8081/curation?type=guidelines')
    .then(response => response.data);

export const getAllStatements = () => 
  axios
    .get('http://localhost:8081/curation?type=statements')
    .then(response => response.data);

export const postGuidelines = ({ factData }) => 
  axios
    .post('http://localhost:8081/save?type=guidelines', { factData })
    .then(response => response.data);

export const postStatement = ({ factData }) => 
  axios
    .post('http://localhost:8081/save?type=statements', { factData })
    .then(response => response.data);