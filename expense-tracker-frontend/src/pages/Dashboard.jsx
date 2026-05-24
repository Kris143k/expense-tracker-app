import { useEffect, useState } from "react"
import axios from "axios"
import api from "../services/api"

import AddExpense from "../components/AddExpense"

function Dashboard() {

  const username = localStorage.getItem("username")

  const [expenses, setExpenses] = useState([])
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const [editingId, setEditingId] = useState(null)

  const [editData, setEditData] = useState({
    title: "",
    amount: "",
    category: ""
  })

  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map(e => e.amount))
      : 0

  const fetchExpenses = async () => {

    try {

      const token = localStorage.getItem("token")

      const response = await api.get(
        "/expenses/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setExpenses(response.data)

    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const token = localStorage.getItem("token")

  const deleteExpense = async (id) => {
    console.log('Deleting expense with id:', id)
    try {
      await axios.delete(
        `http://localhost:8000/expenses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchExpenses()

    } catch (err) {
      console.log(err)
    }
  }

  const updateExpense = async () => {

    try {

      await axios.put(
        `http://localhost:8000/expenses/${editingId}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setEditingId(null)

      fetchExpenses()

    } catch (err) {
      console.log(err)
    }
  }

  const categoryColors = {
  Food: "border-red-500",
  Travel: "border-blue-500",
  Shopping: "border-green-500",
  Bills: "border-yellow-500",
  Other: "border-zinc-500"
}

  return (
    <div className="min-h-screen bg-black text-white">

      <nav className="bg-zinc-900 p-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Expense Tracker
        </h1>

        <button
          className="bg-red-500 px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("username")
            window.location.href = "/"
          }}
        >
          Logout
        </button>

      </nav>

      <div className="p-8 grid md:grid-cols-2 gap-8">

        <div>

          <h2 className="text-3xl font-bold mb-6">
            Welcome {username}
          </h2>

          <AddExpense fetchExpenses={fetchExpenses} />

        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-zinc-400 text-sm">
              Total Expense
            </h2>

            <p className="text-2xl font-bold">
              ₹{totalExpense}
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-zinc-400 text-sm">
              Transactions
            </h2>

            <p className="text-2xl font-bold">
              {expenses.length}
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-zinc-400 text-sm">
              Highest Expense
            </h2>

            <p className="text-2xl font-bold">
              ₹{highestExpense}
            </p>
          </div>

        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">

          <h2 className="text-2xl font-bold mb-4">
            Expenses
          </h2>

          <div className="space-y-4">

            {expenses.map((expense) => (

              <div
                key={expense.id}
                className={`p-4 rounded-xl flex justify-between items-center border-l-8 ${categoryColors[expense.category] || "border-zinc-500"
                  } bg-zinc-800`}
              >

                <div>
                  <h3 className="font-semibold text-lg">
                    {expense.title}
                  </h3>

                  <p
                    className={`text-sm font-semibold ${expense.category === "Food"
                        ? "text-red-400"
                        : expense.category === "Travel"
                          ? "text-blue-400"
                          : expense.category === "Shopping"
                            ? "text-green-400"
                            : expense.category === "Bills"
                              ? "text-yellow-400"
                              : "text-zinc-400"
                      }`}
                  >
                    {expense.category}
                  </p>
                </div>

                <div className="flex items-center gap-4">

                  <span className="font-bold text-lg">
                    ₹ {expense.amount}
                  </span>

                  <button
                    onClick={() => {
                      setEditingId(expense.id)

                      setEditData({
                        title: expense.title,
                        amount: expense.amount,
                        category: expense.category
                      })
                    }}
                    className="bg-blue-500 px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}
          </div>

        </div>
        {editingId && (

          <div className="mt-6 bg-zinc-800 p-4 rounded-xl">

            <input
              type="text"
              placeholder="Title"
              value={editData.title}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  title: e.target.value
                })
              }
              className="w-full p-2 mb-3 text-black"
            />

            <input
              type="number"
              placeholder="Amount"
              value={editData.amount}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  amount: e.target.value
                })
              }
              className="w-full p-2 mb-3 text-black"
            />

            <input
              type="text"
              placeholder="Category"
              value={editData.category}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  category: e.target.value
                })
              }
              className="w-full p-2 mb-3 text-black"
            />

            <button
              onClick={updateExpense}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              Save
            </button>

          </div>
        )}

      </div>

    </div>
  )
}

export default Dashboard