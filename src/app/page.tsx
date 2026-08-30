"use client"

import { todo } from "node:test"
import { useState, useEffect } from "react"
import { Trash2, User2 } from "lucide-react"
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

  const filters = [
    { key : "all", label : "All"},
    { key : "done", label : "Done"},
    { key : "history", label : "History"},
  ] as const

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
            className="text-black text-xl"
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
        <div id="search-bar-container">

        </div>
      </nav>
    </main>
  );
}