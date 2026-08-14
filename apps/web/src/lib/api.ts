import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const REQUEST_TIMEOUT_MS = 15_000

export const api = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})
