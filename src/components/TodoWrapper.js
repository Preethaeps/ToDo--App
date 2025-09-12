import { useState, useEffect } from "react";
import { TodoForm } from "./TodoForm";
import { Todo } from "./Todo";
import { EditTodoForm } from "./EditTodoForm";

export const TodoWrapper = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch(`${API_URL}/todos/`);
        const data = await res.json();
        setTodos(data);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      }
    };
    fetchTodos();
  }, [API_URL]);

  const addTodo = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/todos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: todo }),
      });
      const newTodo = await res.json();
      setTodos([...todos, { ...newTodo, isEditing: false }]);
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updated = await res.json();

      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...updated, isEditing: t.isEditing } : t
        )
      );
    } catch (err) {
      console.error("Toggle complete failed:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const editTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  const editTask = async (task, id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const updated = await res.json();
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...updated, isEditing: false } : t))
      );
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "incomplete") return !todo.completed;
    return true;
  });

  return (
    <div className="TodoWrapper">
      <h1>Preetha's ToDo List!</h1>
      <TodoForm addTodo={addTodo} />

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("incomplete")}>Incomplete</button>
      </div>

      {filteredTodos.map((todo, index) =>
        todo.isEditing ? (
          <EditTodoForm editTodo={editTask} task={todo} key={index} />
        ) : (
          <Todo
            task={todo}
            key={index}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
          />
        )
      )}
    </div>
  );
};
