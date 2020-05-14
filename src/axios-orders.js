import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burgerapp-e4e67.firebaseio.com/'
});

export default instance;
