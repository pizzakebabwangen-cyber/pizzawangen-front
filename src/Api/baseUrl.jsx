import axios from "axios";
const server = import.meta.env.VITE_SERVER;
// const server = "https://pizzawangen.runasp.net/";
const basUrl = axios.create({ baseURL: `${server}` })
// 

export default basUrl