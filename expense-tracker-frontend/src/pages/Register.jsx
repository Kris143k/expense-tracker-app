import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

function Register() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    try {

      await api.post("/signup", {
        username,
        password
      })

      alert("Registration successful")

      navigate("/")

    } catch (err) {
      console.log(err)
      alert("Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-900 p-8 rounded-2xl w-96">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        <form
          onSubmit={handleRegister}
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
            Register
          </button>

        </form>

      </div>

    </div>
  )
}

export default Register