import axios from 'axios'


export const getAllGuidelines = () => 
  axios
    .get('http://localhost:8080/curation?type=guidelines')
    .then(response => response.data);

export const getAllStatements = () => 
  axios
    .get('http://localhost:8080/curation?type=statements')
    .then(response => response.data);