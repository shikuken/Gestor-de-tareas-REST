const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const tasks = ref([]);
    const title = ref('');
    const description = ref('');
    const status = ref('todo');

    const load = async () => {
      try {
        const res = await axios.get('/api/tasks');
        tasks.value = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error('Load error', e);
        tasks.value = [];
      }
    };

    const add = async () => {
      if (!title.value.trim()) return;
      try {
        const res = await axios.post('/api/tasks', { title: title.value, description: description.value, status: status.value });
        tasks.value.push(res.data);
        title.value=''; description.value=''; status.value='todo';
      } catch (e) { console.error('Add error', e); }
    };

    const onDragStart = (e, id) => {
      e.dataTransfer.setData('taskId', id);
    };

    const onDrop = async (e, newStatus) => {
      e.preventDefault();
      const id = Number(e.dataTransfer.getData('taskId'));
      try {
        const res = await axios.put(`/api/tasks/${id}`, { status: newStatus });
        // update local
        const idx = tasks.value.findIndex(t => t.id === id);
        if (idx !== -1) tasks.value[idx] = res.data;
      } catch (e) { console.error('Drop error', e); }
    };

    onMounted(load);

    return { tasks, title, description, status, add, onDragStart, onDrop };
  },

  template: `
    <div style="max-width:1000px; margin:0 auto;">
      <div class="controls">
        <input v-model="title" placeholder="Nueva tarea..." />
        <input v-model="description" placeholder="Descripción (opcional)" />
        <select v-model="status">
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
        <button @click="add">Agregar</button>
      </div>

      <div class="board">
        <div class="col" @dragover.prevent @drop="(e) => onDrop(e, 'todo')">
          <h2>To Do</h2>
          <div v-for="t in tasks.filter(x => x.status === 'todo')" :key="t.id" class="task" draggable="true" @dragstart="(e)=>onDragStart(e,t.id)">
            <strong>{{ t.title }}</strong>
            <div class="small">{{ t.description }}</div>
          </div>
        </div>

        <div class="col" @dragover.prevent @drop="(e) => onDrop(e, 'doing')">
          <h2>Doing</h2>
          <div v-for="t in tasks.filter(x => x.status === 'doing')" :key="t.id" class="task" draggable="true" @dragstart="(e)=>onDragStart(e,t.id)">
            <strong>{{ t.title }}</strong>
            <div class="small">{{ t.description }}</div>
          </div>
        </div>

        <div class="col" @dragover.prevent @drop="(e) => onDrop(e, 'done')">
          <h2>Done</h2>
          <div v-for="t in tasks.filter(x => x.status === 'done')" :key="t.id" class="task" draggable="true" @dragstart="(e)=>onDragStart(e,t.id)">
            <strong>{{ t.title }}</strong>
            <div class="small">{{ t.description }}</div>
          </div>
        </div>
      </div>
    </div>
  `
}).mount('#app');
