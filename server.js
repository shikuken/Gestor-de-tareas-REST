const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory tasks (no persistence)
let tasks = [];
let nextId = 1;

// API
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
}); 

// 🔍 Obtener una tarea por ID
app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, status } = req.body;
  if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Title is required' });
  const now = new Date().toISOString();
  const task = {
    id: nextId++,
    title,
    description: description || '',
    status: status === 'doing' || status === 'done' ? status : 'todo',
    created_at: now,
    updated_at: now
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description, status } = req.body;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  if (title !== undefined) tasks[idx].title = title;
  if (description !== undefined) tasks[idx].description = description;
  if (status !== undefined && (status === 'todo' || status === 'doing' || status === 'done')) tasks[idx].status = status;
  tasks[idx].updated_at = new Date().toISOString();
  res.json(tasks[idx]);
});

// 🗑️ Eliminar una tarea por ID
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.json({ message: 'Tarea eliminada correctamente', deletedTask });
});


// Serve static UI
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT);
});
