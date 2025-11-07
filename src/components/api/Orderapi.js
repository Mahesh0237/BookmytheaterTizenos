import Config from '../../config';
import axios from 'axios';

export default axios.create({
    baseURL: `${Config.api_url}/orders/`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});
