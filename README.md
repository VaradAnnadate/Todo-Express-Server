
# Todo App in Express
0% vibe coded!

### To Make:

todo should contain:

    -id
    -title
    -completed

### Routes:

GET /todos --> All todos ✅


GET /todos/:id --> Particular todo {if id exists} ✅


POST /todos --> Create a todo ✅

```
Post in format 

{
    "id": number,
    "title": non-empty string,
}
```


PUT /todos:/id --> Update given todo ✅

```
"PUT" toggles the "completed" status for the given id
```

DELETE /todos/:id --> Delete given todo ✅