import { useState } from "react"
import api from "../services/api"

function AddExpense({ fetchExpenses }) {

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {

      const token = localStorage.getItem("token")

      await api.post(
        "/expenses/",
        {
          title,
          amount: Number(amount),
          category
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setTitle("")
      setAmount("")

      fetchExpenses()

    } catch (err) {
      console.log(err)
      alert("Failed to add expense")
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl">

      <h2 className="text-2xl font-bold mb-4">
        Add Expense
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 outline-none"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 outline-none"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 outline-none"
        />

        <button
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
        >
          Add
        </button>

      </form>

    </div>
  )
}

export default AddExpense