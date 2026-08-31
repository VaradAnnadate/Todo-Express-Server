const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs/promises');
const port = 3000;

// parse requests with a Content-Type of application/json
app.use(express.json());

// let todos = [
//     {
//         "id": 1,
//         "title": "make todo server app",
//         "completed": false
//     }
// ];

let todos = [];

async function readTodos() {
    const todoPath = path.join(__dirname, "todos.json");
    // console.log("in readtodos")
    const rawData = await fs.readFile(todoPath, "utf-8");
    return JSON.parse(rawData);
}

async function writeTodos() {
    const todoPath = path.join(__dirname, "todos.json");

    const dataToWrite = {
        "todos": todos
    }

    await fs.writeFile(todoPath, JSON.stringify(dataToWrite), (err) => {
        res.status(500).json({ error: "Failed to read todos." });
        return
    });

    // console.log(dataToWrite);

}

async function findTodo(todoId) {
    try {
        const data = await readTodos();
        todos = data.todos;

        const todoIdx = todos.findIndex(todo => todo.id === todoId);
        const todoFound = todoIdx !== -1;

        return [todoFound, todoIdx];
    } catch (err) {
        res.status(500).json({ error: "Failed to read todos." });
        return [false, -1];
    }
}

app.get('/todos', async (req, res) => {
    // equivalent to writing head application/json
    // let todos = await readTodos();

    // res.json(todos);
    try {
        const data = await readTodos();
        res.json(data.todos);
    } catch (err) {
        res.status(500).json({ error: "Failed to read todos." });
    }
});

app.get('/todos/:id', async (req, res) => {
    // The id is accesible through req.params.id
    const todoId = req.params.id;
    const numericTodoId = Number(todoId);

    // res.send(`Todo id is ${todoId}`)

    // use res.status to write status code
    if (isNaN(numericTodoId)) {
        res.status(400);
        res.json({ "error": "Invalid ID format. ID must be a number." });
        return
    }

    const [todoFound, idx] = await findTodo(numericTodoId);

    // console.log(todoFound);

    if (todoFound) {
        res.json(todos[idx]);
    } else {
        res.status(404);
        res.json({ "error": `Todo item with ID ${todoId} not found.` });
    }

});

app.post('/todos', async (req, res) => {
    // req data is accessible by req.body 
    // res.send(req.body);

    await readTodos();

    const { id, title } = req.body;

    if (
        typeof id !== 'number' ||
        typeof title !== 'string' ||
        title.trim() === ''
    ) {
        res.status(400);
        res.json({ "error": "Invalid todo format. Must include numeric 'id', non-empty string 'title'." });
        return
    }

    const [todoFound, idx] = await findTodo(id);

    if (todoFound) {
        res.status(409);
        res.json({ "error": `Todo item with ID ${id} already exists.` });
    } else {
        todos.push({
            "id": id,
            "title": title.trim(),
            "completed": false
        });

        await writeTodos();

        res.status(201)
        res.json({ "success": `Todo item with ID ${id} pushed successfully.` });
    }

});

app.put('/todos/:id', (req, res) => {
    const todoId = req.params.id;
    const numericTodoId = Number(todoId);

    if (isNaN(numericTodoId)) {
        res.status(400);
        res.json({ "error": "Invalid id format. id must be a number" });
        return
    }


    const [todoFound, idx] = findTodo(numericTodoId);

    if (todoFound) {
        todos[idx]["completed"] = todos[idx]["completed"] == true ? false : true;
        res.json({ "success": `Set completed of todo item with ID ${todoId} to ${todos[idx]["completed"]}.` });
    } else {
        res.status(404);
        res.json({ "error": `Todo item with ID ${todoId} not found.` });
    }
});

app.delete('/todos/:id', (req, res) => {
    const todoId = req.params.id;
    const numericTodoId = Number(todoId);

    if (isNaN(numericTodoId)) {
        res.status(400);
        res.json({ "error": "Invalid id format. id must be a number" });
        return
    }

    const [todoFound, idx] = findTodo(numericTodoId);

    if (todoFound) {
        todos.splice(idx, 1);
        res.json({ "success": `Todo item with ID ${todoId} deleted successfully.` });
    } else {
        res.status(404);
        res.json({ "error": `Todo item with ID ${todoId} not found.` });
    }
});

app.use((req, res) => {
    // This acts as the else block in the http createServer. If the route and method entered doesnt match any route and method from above this is fired.

    res.status(404);
    res.json({ "error": "Route not found" });
});

app.listen(port, () => {
    console.log(`Todo app listening on port ${port}. Read the README file to understand how the app works!`);
});