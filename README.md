
# Todo App in Express
0% vibe coded!
## Routes:

**GET** `/todos` --> All todos 


**GET** `/todos/:id` --> Particular todo {if id exists} 


**POST** `/todos` --> Create a todo 

```
Post in the format 

{
    "id": number,
    "title": non-empty string,
}
```


**PUT** `/todos:/id` --> Update given todo 

```
"PUT" toggles the "completed" status of a todo for the given id
```

**DELETE** `/todos/:id` --> Delete given todo 