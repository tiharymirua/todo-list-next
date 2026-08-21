"use client"

import { todo } from "node:test"
import { useState, useEffect } from "react"

type Todo = {
  id: number,
  text: string,
  done: boolean
}

export default function Home(){
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")

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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Loop Habit Tracker
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nouvelle tâche"
            className="flex-1 text-black border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => {
              if(e.key === "Enter"){
                  addTodo()
                }
              } 
            }
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ajouter
          </button>
        </div>
        <ul className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-around px-4 w-100"
            >
              <input 
                type="checkbox" 
                className="w-10"
              />
              <span
                onClick={() => toggleTodo(todo.id, todo.done)}
                className={`cursor-pointer ${
                  todo.done ? "line-through text-gray-400" : "text-gray-800"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id, todo.done)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}