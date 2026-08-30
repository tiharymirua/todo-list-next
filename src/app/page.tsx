"use client"

import { todo } from "node:test"
import { useState, useEffect } from "react"
import { Trash2, User2 } from "lucide-react"

type Todo = {
  id: number,
  text: string,
  done: boolean
}

export default function Home(){
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")

  const [filter, setFilter] = useState<"all"|"done"|"history">("all")

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
              className="w-auto flex gap-3 text-gray-600 bg-gray-100 p-1 rounded-xl"
            >
              <button 
                onClick={() => setFilter("all")}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${
                  filter === "all"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >All</button>
              <button 
                onClick={() => setFilter("done")}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${
                  filter === "done"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >Done</button>
              <button 
                onClick={() => setFilter("history")}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 ${
                  filter === "history"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >History</button>
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