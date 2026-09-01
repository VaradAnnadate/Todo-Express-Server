const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs/promises");
const port = 3000;

// parse requests with a Content-Type of application/json
app.use(express.json());

let todos = [];

let readAtleastOnce = false;

async function readTodos() {
  const todoPath = path.join(__dirname, "todos.json");
  // console.log("in readtodos")
  const rawData = await fs.readFile(todoPath, "utf-8");
  todos = JSON.parse(rawData).todos;
}

async function writeTodos() {
  const todoPath = path.join(__dirname, "todos.json");

  const dataToWrite = {
    todos: todos,
  };

  await fs.writeFile(todoPath, JSON.stringify(dataToWrite), (err) => {
    res.status(500).json({ error: "Failed to write todos." });
    return;
  });
}

async function findTodo(todoId, res) {
  try {
    const todoIdx = todos.findIndex((todo) => todo.id === todoId);
    const todoFound = todoIdx !== -1;

    return [todoFound, todoIdx];
  } catch (err) {
    res.status(500).json({ error: "Failed to read todos." });
    return [false, -1];
  }
}

app.get("/todos", async (req, res) => {
  // equivalent to writing head application/json

  try {
    await readTodos();

    readAtleastOnce = true;
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to read todos." });
  }
});

app.get("/todos/:id", async (req, res) => {
  // The id is accesible through req.params.id
  const todoId = req.params.id;
  const numericTodoId = Number(todoId);

  // res.send(`Todo id is ${todoId}`)

  // use res.status to write status code
  if (isNaN(numericTodoId)) {
    res.status(400).json({ error: "Invalid ID format. ID must be a number." });
    return;
  }

  if (!readAtleastOnce) {
    await readTodos();
    readAtleastOnce = true;
  }

  const [todoFound, idx] = await findTodo(numericTodoId, res);

  // console.log(todoFound);

  if (todoFound) {
    res.json(todos[idx]);
  } else {
    res.status(404).json({ error: `Todo item with ID ${todoId} not found.` });
  }
});

app.post("/todos", async (req, res) => {
  // req data is accessible by req.body
  // res.send(req.body);

  if (!readAtleastOnce) {
    await readTodos();
    readAtleastOnce = true;
  }

  const { id, title } = req.body;

  if (
    typeof id !== "number" ||
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    res.status(400);
    res.json({
      error:
        "Invalid todo format. Must include numeric 'id', non-empty string 'title'.",
    });
    return;
  }

  const [todoFound, idx] = await findTodo(id, res);

  if (todoFound) {
    res.status(409);
    res.json({ error: `Todo item with ID ${id} already exists.` });
  } else {
    todos.push({
      id: id,
      title: title.trim(),
      completed: false,
    });

    await writeTodos();

    res.status(201);
    res.json({ success: `Todo item with ID ${id} pushed successfully.` });
  }
});

app.put("/todos/:id", async (req, res) => {
  const todoId = req.params.id;
  const numericTodoId = Number(todoId);

  if (isNaN(numericTodoId)) {
    res.status(400);
    res.json({ error: "Invalid id format. id must be a number" });
    return;
  }

  if (!readAtleastOnce) {
    await readTodos();
    readAtleastOnce = true;
  }

  const [todoFound, idx] = await findTodo(numericTodoId, res);

  if (todoFound) {
    todos[idx]["completed"] = todos[idx]["completed"] == true ? false : true;

    await writeTodos();

    res.json({
      success: `Set completed of todo item with ID ${todoId} to ${todos[idx]["completed"]}.`,
    });
  } else {
    res.status(404);
    res.json({ error: `Todo item with ID ${todoId} not found.` });
  }
});

app.delete("/todos/:id", async (req, res) => {
  const todoId = req.params.id;
  const numericTodoId = Number(todoId);

  if (isNaN(numericTodoId)) {
    res.status(400);
    res.json({ error: "Invalid id format. id must be a number" });
    return;
  }

  if (!readAtleastOnce) {
    await readTodos();
    readAtleastOnce = true;
  }

  const [todoFound, idx] = await findTodo(numericTodoId, res);

  if (todoFound) {
    todos.splice(idx, 1);

    await writeTodos();

    res.json({ success: `Todo item with ID ${todoId} deleted successfully.` });
  } else {
    res.status(404);
    res.json({ error: `Todo item with ID ${todoId} not found.` });
  }
});

// This is known as middleware (runs before all of the route handlers)
// middleware function gets 3 params req,res,next
app.use((req, res) => {
  // This acts as the else block in the http createServer. If the route and method entered doesnt match any route and method from above this is fired.
  res.status(404);
  res.json({ error: "Route not found" });
  // next(); this function is used to go to the actual route handler (as use is written atlast here, the middleware acts as the default route handler)
});

app.listen(port, () => {
  console.log(
    `Todo app listening on port ${port}. Read the README file to understand how the app works!`,
  );
});
