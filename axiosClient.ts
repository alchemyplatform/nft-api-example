import http from "http";
import axios from "axios";

export const axiosClient = axios.create({
  timeout: 10000,
  httpAgent: new http.Agent({ keepAlive: true }),
});
