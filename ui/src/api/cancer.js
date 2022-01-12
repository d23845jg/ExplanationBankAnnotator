import axios from 'axios'

export const getMostCommonFacts = (query) => 
  axios
    .get(`/ExplanationTreeAPI/search?query=${query}`)
    .then(response => response.data);

export const getTrainSearchSystemModel = () =>
  axios
    .get('/ExplanationTreeAPI/search?train=true')
    .then(response => response.data);