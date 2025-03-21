import axios from "axios";


// Example API URL (replace with your desired API)
const apiUrl = 'https://jsonplaceholder.typicode.com/users';

//const apiUrl = 'https://dog.ceo/api/breeds/image/random'
// Create a function to fetch data
const fetchData = () =>{
  const reponse = axios.get(apiUrl)

  .then(response =>{
    // Handle the response data
     console.log('Data fetched successfully:', response.data);
  })
  .catch(error =>{
    //Handle the errror data
    console.log('Error fetching data:', error.message)
  })
}

export {fetchData};