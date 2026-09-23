"use client"

import { todo } from "node:test"
import { useState, useEffect } from "react"
import { Archive, Trash2, User2, Search, SlidersHorizontal, Play, Plus, Pencil } from "lucide-react"
import { motion } from "framer-motion"
import { div, filter } from "framer-motion/client"

type Status = "En attente" | "en cours" 

type Todo = {
  id: number,
  text: string,
  done: boolean,
  status: Status,
  deadline: string | null,
  priority: string,
  createdAt: string,
}

export default function Home(){
  //Priorité
  type Priority = "normal" | "priorité" | "urgent"
  //Declaration des hooks d'etat
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [filter, setFilter] = useState<"all" | "done" | "history">("all");
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deadline, setDeadline] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  function openEditModal(todo: Todo){
    setEditingTodo(todo)
    setIsEditModalOpen(true)
  }

  //Filtres
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
  //Rest API calls
  useEffect(() => {
    fetch("api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
  }, [])
  //Fonction d'ajout d'une tache
  async function addTodo(){
    if(input.trim() === "") return

    const res = await fetch("api/todos", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify({ 
        text: input,
        deadline: deadline || null,
        priority: priority,
      }),
    })

    const newTodo = await res.json()

    setTodos([...todos, newTodo])
    setInput("")
    setDeadline("")
    setPriority("normal")
  }
  //Fonction de marquage de tache comme faite ou non faite
  async function toggleTodo(id: number, done: boolean){
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({done: !done}),
    })

    const updated = await res.json()
    setTodos(todos.map( (t) => (t.id === id ? updated : t)))
  }
  //Fonction pour démarrer le minuteur du todo
  async function startTodo(id: number){
    const res = await fetch(`/api/todos/$[id]`, {
      method: "PATCH",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({status: "en cours"})
    })

    const updated = await res.json()
    setTodos(todos.map((t) => (t.id === id ? updated:t)))
  }
  //Fonction pour archiver une tache
  async function archiveTodo(id: number){
    await fetch(`api/todos/${id}`, {method: "DELETE"})
    setTodos(todos.filter((t) => t.id !== id))
  }
  //Fonction de suppression d'une tache
  async function deleteTodo(id: number){
    await fetch(`api/todos/${id}`, {
      method: "DELETE"
    })
    setTodos(todos.filter((t) => t.id != id))
  }

  //Update Todos
  async function updateTodo(){
    if(!editingTodo) return

    const res = await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PATCH",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({
        text: editingTodo.text,
        deadline: editingTodo.deadline || null,
        priority: editingTodo.priority,
      }),
    })

    const updated = await res.json()
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)))
    setIsEditModalOpen(true)
    setEditingTodo(null)
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
          <div className="relative flex flex-1 items-center gap-2">
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:translate-y-1">
                <Plus size={20}/>         
              </button>
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
              <th className="font-medium px-3">Actions</th>
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
                        : todo.status === "en cours"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {todo.done
                      ? "Terminé"
                      : todo.status === "en cours"
                      ? "En cours"
                      : "en attente"}
                  </span>
                </td>
                <td className="px-3 text-gray-500 text-sm">
                  {todo.deadline
                    ? new Date(todo.deadline).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      todo.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : todo.priority === "priorité"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {todo.priority}
                  </span>
                </td>
                <td className="px-3 rounded-r-lg">
                  <div className="flex gap-2">
                    {!todo.done && todo.status === "En attente" && (
                      <button
                        onClick={() => startTodo(todo.id)}
                        className="text-gray-500 hover:text-green-600 transition-all duration-200 hover:-translate-y-1"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {todo.done && (
                      <button
                        onClick={() => archiveTodo(todo.id)}
                        className="text-gray-500 hover:text-purple-600 transition-all duration-200 hover:-translate-y-1"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(todo)}
                      className="text-gray-500 hover:text-blue-600 transition-all duration-200 hover:-translate-y-1"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-500 hover:text-red-600 transition-all duration-200 hover:-translate-y-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Nouvelle tâche
          </h2>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e)  => {
              if(e.key === "Enter") {
                addTodo()
                setIsModalOpen(false)
              }
            }}
            placeholder="Nom de la tâche"
            autoFocus
            className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Priorité</label>
            <div className="flex gap-2">
              {(["normal", "priorité", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all duration-200 ${
                    priority === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                addTodo()
                setIsModalOpen(false)
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"  
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    )
    }
    {isEditModalOpen && editingTodo && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Modifier la tâche
          </h2>

          <input
            value={editingTodo.text}
            onChange={(e) =>
              setEditingTodo({ ...editingTodo, text: e.target.value })
            }
            className="w-full text-black border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Deadline</label>
            <input
              type="date"
              value={editingTodo.deadline?.slice(0, 10) ?? ""}
              onChange={(e) =>
                setEditingTodo({ ...editingTodo, deadline: e.target.value })
              }
              className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Priorité</label>
            <div className="flex gap-2">
              {(["normal", "priorité", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setEditingTodo({ ...editingTodo, priority: p })
                  }
                  className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all duration-200 ${
                    editingTodo.priority === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTodo(null);
              }}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              onClick={updateTodo}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    )}
    </main>
  );
}