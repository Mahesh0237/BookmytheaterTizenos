import axios from 'axios';
import Config from "../../config.jsx";

const Authapi = axios.create({
  baseURL: `${Config.api_url}/auth/`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default Authapi;
