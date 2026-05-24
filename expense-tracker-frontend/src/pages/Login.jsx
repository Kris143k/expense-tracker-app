import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Login() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {

      const formData = new URLSearchParams()

      formData.append("username", username)
      formData.append("password", password)

      const response = await api.post(
        "/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      )

      localStorage.setItem(
        "token",
        response.data.access_token
      )

      localStorage.setItem("username", username)

      localStorage.setItem("username", username)

      navigate("/dashboard")

      alert("Login successful")

      console.log(response.data)

    } catch (err) {
      console.log(err)
      alert("Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-900 p-8 rounded-2xl w-96">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 outline-none"
          />

          <button
            className="w-full bg-white text-black p-3 rounded-lg font-semibold"
          >
            Login
          </button>

          <p className="mt-4 text-center">
            Don't have an account?

            <span
              className="text-blue-400 cursor-pointer ml-2"
              onClick={() => window.location.href = "/register"}
            >
              Signup
            </span>
          </p>

        </form>

      </div>

    </div>
  )
}

export default Login