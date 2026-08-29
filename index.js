const express = require('express');
const app = express()
const port = 3000

// parse requests with a Content-Type of application/json
app.use(express.json());

let todos = [
    {
        "id": 1,
        "title": "make todo server app",
        "completed": false
    }
]

function findTodo(todoId) {
    const todoIdx = todos.findIndex(todo => todo.id === todoId);
    const todoFound = todoIdx !== -1;

    return [todoFound, todoIdx];
}

app.get('/todos', (req, res) => {
    // equivalent to writing head application/json
    res.json(todos)
})

app.get('/todos/:id', (req, res) => {
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

    const [todoFound, idx] = findTodo(numericTodoId)

    // console.log(todoFound);

    if (todoFound) {
        res.json(todos[idx]);
    } else {
        res.status(404);
        res.json({ "error": `Todo item with ID ${todoId} not found.` });
    }

});

app.post('/todos', (req, res) => {
    // req data is accessible by req.body 
    // res.send(req.body);

    const { id, title } = req.body;

    if (
        typeof id !== 'number' ||
        typeof title !== 'string' ||
        title.trim() === ''
    ) {
        res.status(400)
        res.json({ "error": "Invalid todo format. Must include numeric 'id', non-empty string 'title'." });
        return
    }

    const [todoFound, idx] = findTodo(id);

    if (todoFound) {
        res.status(409)
        res.json({ "error": `Todo item with ID ${id} already exists.` })
    } else {
        todos.push({
            "id": id,
            "title": title.trim(),
            "completed": false
        })
        res.status(201)
        res.json({ "success": `Todo item with ID ${id} pushed successfully.` })
    }

})

app.put('/todos/:id', (req, res) => {
    const todoId = req.params.id;
    const numericTodoId = Number(todoId);

    const [todoFound, idx] = findTodo(numericTodoId);

    if(todoFound){
        // Yet to make
    }
})

app.listen(port, () => {
    console.log(`Todo app listening on port ${port}`)
})