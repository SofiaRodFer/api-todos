const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  function userProcessing(username) {
    const user = users.find(user => user.username === username)

    if(!user) {
      return response.status(400).json({error: "User not found"}) 
    }

    request.user = user
    return next()
  }

  if(request.body.username) {
    const { username } = request.body
    userProcessing(username)
  }

  if(request.headers.username) {
    const { username } = request.headers
    userProcessing(username)
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(
    (user) => user.username === username
  )

  if(userAlreadyExists) {
    return response.status(400).json({error: "User already exists"})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find(user => user.username === username)
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline, username } = request.body

  const currentUser = users.find(user => user.username === username)

  if(currentUser) {
    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }
  
    currentUser.todos.push(todo)
  
    return response.status(201).json(todo)
  }

  return response.status(400).json({error: "User not found"})
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  const currentUser = users.find(user => user.username === username)
  const currentTodo = currentUser.todos.find(todo => todo.id === request.params.id)

  if(!currentTodo) {
    return response.status(400).json({error: "ID does not match any current todos"})
  }
  
  currentTodo.title = title
  currentTodo.deadline = new Date(deadline)

  return response.status(201).json(currentTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const currentUser = users.find(user => user.username === username)
  const currentTodo = currentUser.todos.find(todo => todo.id === request.params.id)

  if(!currentTodo) {
    return response.status(400).json({error: "ID does not match any current todos."})
  }
  
  currentTodo.done = true

  return response.status(201).json(currentTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const currentUser = users.find(user => user.username === username)
  const currentTodo = currentUser.todos.find(todo => todo.id === request.params.id)

  if(!currentTodo) {
    return response.status(400).json({error: "ID does not match any current todos."})
  }
  
  console.log(currentUser.todos)
  currentUser.todos.splice(currentTodo, 1)

  return response.status(200).send()
});

app.listen(3333);