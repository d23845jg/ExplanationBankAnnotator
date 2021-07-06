import axios from 'axios'


export const fetcher = (query) => 
  axios
    .get(`http://localhost:8080/search?query=${query}`)
    .then(response => response.data);