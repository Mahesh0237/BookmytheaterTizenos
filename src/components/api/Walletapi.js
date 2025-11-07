import axios from 'axios';
import Config from '../../config';

export default axios.create({
    baseURL: `${Config.api_url}/wallet/`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});