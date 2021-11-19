import axios from 'axios'


export const getMostCommonFacts = (query) => 
  axios
    .get(`http://localhost:8080/search?query=${query}`)
    .then(response => response.data);