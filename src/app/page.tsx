"use client"

import { todo } from "node:test"
import { useState, useEffect } from "react"
import { Trash2, User2, Search, SlidersHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { filter } from "framer-motion/client"

type Todo = {
  id: number,
  text: string,
  done: boolean
}

export default function Home(){
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [filter, setFilter] = useState<"all" | "done" | "history">("all");
  const [search, setSearch] = useState("")

  const filters = [
    { key : "all", label : "All"},
    { key : "done", label : "Done"},
    { key : "history", label : "History"},
  ] as const

  const filteredTodos = todos.filter(
    (todo) => {
      if(filter === "done") return todo.done
      if(filter === "history") return todo.done // Modifier plus tard pour les historiques
      return true
    }
  ).filter(
    (todo) => todo.text.toLocaleLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    fetch("api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
  }, [])

  async function addTodo(){
    if(input.trim() === "") return

    const res = await fetch("api/todos", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify({ text: input}),
    })

    const newTodo = await res.json()

    setTodos([...todos, newTodo])
    setInput("")
  }

  async function toggleTodo(id: number, done: boolean){
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({done: !done}),
    })

    const updated = await res.json()
    setTodos(todos.map( (t) => (t.id === id ? updated : t)))
  }

  async function deleteTodo(id: number, done: boolean){
    await fetch(`api/todos/${id}`, {
      method: "DELETE"
    })
    setTodos(todos.filter((t) => t.id != id))
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-6 px-4">
      <nav>
        <div
          className="flex justify-between items-center"  
        >
          <h1
            className="text-gray-500 text-xl"
          >Tâches</h1>
          <div className="flex gap-2">
            <div 
              id="button-group"
              className="relative w-auto flex gap-3 text-gray-600 bg-gray-100 p-1 rounded-xl"
            >
              {
                filters.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="relative cursor-pointer px-3 py-1 rounded-lg z-10"
                  >
                    {
                      filter === key && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 bg-white rounded-lg shadow-md -z-10"
                          transition = {{type: "spring", stiffness: 400, damping: 30}}
                        />
                      )
                    }
                    <span
                      className={filter === key ? "text-gray-900" : "text-gray-600"}
                    >
                      {label}
                    </span>
                  </button>
                ))
              }
            </div>
            <button className="text-gray-600 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-transparent">
              <User2 />
            </button>
          </div>
        </div>
        <div id="search-bar-container" className="mt-4 flex justify-between items-center">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e)=> setSearch(e.target.value)}
              placeholder="Rechercher une tache..."
              className="w-100 pl-10 pr-4 py-2 bg-gray-100 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <div className="filter-button flex gap-3 pe-3 items-center text-gray-500">
              <SlidersHorizontal />
              <p className="text-lg">Filtres</p>
          </div>
        </div>
      </nav>

      <section id="todo-list-heart text-center">
        <table className="w-full mt-4 border-separate border-spacing-y-2">
          <thead className="text-gray-500 text-sm text-left">
            <tr>
              <th className="font-medium px-3"></th>
              <th className="font-medium px-3">Clé</th>
              <th className="font-medium px-3">Nom</th>
              <th className="font-medium px-3">Status</th>
              <th className="font-medium px-3">Dead line</th>
              <th className="font-medium px-3">Priorité</th>
            </tr>
          </thead>
          <tbody>
            {filteredTodos.map((todo) => (
              <tr
                key={todo.id}
                className="bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <td className="px-3 py-3 rounded-l-lg">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id, todo.done)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-3 text-gray-400 text-sm">{todo.id}</td>
                <td
                  className={`px-3 ${
                    todo.done ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {todo.text}
                </td>
                <td className="px-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      todo.done
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {todo.done ? "Terminé" : "En cours"}
                  </span>
                </td>
                <td className="px-3 text-gray-400">—</td>
                <td className="px-3 rounded-r-lg text-gray-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}