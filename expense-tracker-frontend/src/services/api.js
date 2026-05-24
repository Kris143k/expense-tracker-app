import axios from "axios"

const api = axios.create({
  baseURL: "https://expense-tracker-api-hrtx.onrender.com/"
})

export default api