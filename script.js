function ScrollCss() {
  const tasksEl = document.getElementById("tasks");
  if (tasksEl.scrollHeight - tasksEl.scrollTop === tasksEl.clientHeight) {
    document.querySelector(".add_task").style.display = "none";
  } else {
    document.querySelector(".add_task").style.display = "flex";
  }
}
document.getElementById("tasks").addEventListener("scroll", ScrollCss, false);

if (
  JSON.parse(localStorage.getItem("tasks")) == "" ||
  !localStorage.getItem("tasks")
) {
  document.querySelector(
    ".right"
  ).innerHTML = `<div class="no_tasks">There's nothing here. <br> Add your first task!</div>`;
}

document.getElementById("add_task_btn").addEventListener("click", () => {
  const new_task_modal = new WinBox("New task", {
    modal: true,
    mount: document.getElementById("add_task_modal"),
    header: 50,
  });
});

function addTaskToLocalStorage(title, description, priority, status) {
  const task = { title, description, priority, status, notes: [] };
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTaskStatus(taskElement, task) {
  task.status = task.status === "unchecked" ? "checked" : "unchecked";
  const statusImg = taskElement.querySelector(".task_actions img.task_status");
  statusImg.src = `/img/${task.status}.svg`;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === task.title);
  if (index !== -1) {
    tasks[index].status = task.status;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function addTaskFromLocalStorage(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");

  taskElement.innerHTML = `
    <div class="task_title_priority">
      <h1>${task.title}</h1>
      <div class="priority_container">
        <p>${task.priority}</p>
        <img src="/img/flag_${task.priority}.svg" />
      </div>
    </div>
    <div class="task_actions">
      <img src="/img/delete.svg" class="delete_task_btn"/>
      <img src="/img/${task.status}.svg" class="task_status" />
      <img src="/img/arrow.svg" />
    </div>
  `;

  taskElement.addEventListener("click", () => {
    document
      .querySelectorAll(".task")
      .forEach((el) => el.classList.remove("currentTask"));
    taskElement.classList.add("currentTask");

    document.getElementById("task_title").textContent = task.title;
    document.getElementById("description").textContent = task.description;
    document.getElementById("priority_select").value = task.priority;
    document.querySelector(
      ".right .main_info .task_actions .priority_done #task_status"
    ).src = `/img/${task.status}.svg`;

    if (task.notes) {
      displayNotes(task.notes);
    }
    if (task.todos) {
      displayToDo(task.todos);
    }

    const prioritySelect = document.getElementById("priority_select");
    prioritySelect.removeEventListener("change", updatePriority);
    prioritySelect.addEventListener("change", updatePriority);

    document
      .getElementById("add_note_btn")
      .removeEventListener("click", openAddNoteModal);
    document
      .getElementById("add_note_btn")
      .addEventListener("click", openAddNoteModal);

    document
      .querySelector(".right .main_info .title_delete .edit")
      .removeEventListener("click", openEditTaskModal);
    document
      .querySelector(".right .main_info .title_delete .edit")
      .addEventListener("click", openEditTaskModal);

    document
      .getElementById("new_to_do_a")
      .removeEventListener("click", openAddToDo);
    document
      .getElementById("new_to_do_a")
      .addEventListener("click", openAddToDo);

    document.getElementById("exit_new_to_do").addEventListener("click", () => {
      document.getElementById("new_to_do_task_input").value = "";
      document.getElementById("new_to_do_a").style.display = "block";
      document.getElementById("new_to_do_elements").style.display = "none";
    });
  });

  taskElement
    .querySelector(".task_status")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      toggleTaskStatus(taskElement, task);
      taskElement.click();
    });

  taskElement
    .querySelector(".delete_task_btn")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      deleteTask(taskElement, task.title);
    });

  document.getElementById("tasks").appendChild(taskElement);
}

function openAddToDo() {
  document.getElementById("new_to_do_a").style.display = "none";
  document.getElementById("new_to_do_elements").style.display = "flex";

  document
    .querySelector(`#new_to_do_elements button`)
    .removeEventListener("click", () => {
      submitAddToDo();
    });
  document
    .querySelector(`#new_to_do_elements button`)
    .addEventListener("click", () => {
      submitAddToDo();
    });

  document
    .querySelector(`#add_note_modal input[type="button"]`)
    .removeEventListener("click", () => {
      submitAddNote(addNoteModal);
    });
  document
    .querySelector(`#add_note_modal input[type="button"]`)
    .addEventListener("click", () => {
      submitAddNote(addNoteModal);
    });
}

function submitAddToDo() {
  const newToDoContent = document.querySelector("#new_to_do_task_input").value;
  const taskElement = document.querySelector(".currentTask");
  const taskTitle = taskElement.querySelector("h1").textContent;

  const todo = {
    content: newToDoContent,
  };

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === taskTitle);
  if (index !== -1) {
    if (!tasks[index].todos) tasks[index].todos = [];
    tasks[index].todos.push(todo);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayToDo(tasks[index].todos);
  }

  document.querySelector("#new_to_do_task_input").value = "";
  document.getElementById("new_to_do_a").style.display = "block";
  document.getElementById("new_to_do_elements").style.display = "none";
}

function displayToDo(todos) {
  const todosContainer = document.querySelector("#to_do_list");
  todosContainer.innerHTML = "";
  todos.forEach((todo, todoIndex) => {
    console.log(todo, todoIndex);
    const todoElement = document.createElement("div");
    todoElement.classList.add("todo");
    todoElement.innerHTML = `
      <div class="to_do_wrapper">
        <div class="to_do_content">${todo.content}</div>
        <div class="to_do_actions">
          <img src="/img/delete.svg" class="delete_todo_btn" />
          <img src="/img/edit.svg" class="edit_todo_btn" />
        </div>
      </div>
    
      <div id="edit_to_do_elements" style="display: none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            class="x_icon"
            id="exit_edit_to_do"
          >
            <use xlink:href="/img/plus.svg#plus"></use>
          </svg>
          <input
            type="text"
            id="edit_to_do_task_input"
            class="edit_to_do_task_input"
          />
          <button
            id="submit_edit_to_do_task"
            class="submit_edit_to_do_task"
          >
            Submit
          </button>
      </div>
    `;

    todoElement
      .querySelector(".delete_todo_btn")
      .addEventListener("click", () => {
        deleteToDo(todoIndex);
      });

    todoElement
      .querySelector(".edit_todo_btn")
      .addEventListener("click", () => {
        openEditToDoModal(todoElement, todoIndex, todo);
      });

    todosContainer.appendChild(todoElement).cloneNode(true);
  });
}

function deleteToDo(todoIndex) {
  const delete_todo_modal = new WinBox("Delete to do task", {
    modal: true,
    mount: document.getElementById("delete_todo_modal"),
    header: 50,
    height: 300,
  });

  document
    .querySelector("#delete_todo_modal .buttons #accept")
    .removeEventListener("click", () =>
      confirmDeleteTodo(todoIndex, delete_todo_modal)
    );
  document
    .querySelector("#delete_todo_modal .buttons #accept")
    .addEventListener("click", () =>
      confirmDeleteTodo(todoIndex, delete_todo_modal)
    );

  document
    .querySelector("#delete_todo_modal .buttons #cancel")
    .removeEventListener("click", () =>
      closeDeleteTodoModal(delete_todo_modal)
    );
  document
    .querySelector("#delete_todo_modal .buttons #cancel")
    .addEventListener("click", () => closeDeleteTodoModal(delete_todo_modal));

  function closeDeleteTodoModal(delete_todo_modal) {
    delete_todo_modal.close();
  }

  function confirmDeleteTodo(todoIndex, delete_todo_modal) {
    const taskElement = document.querySelector(".currentTask");
    const taskTitle = taskElement.querySelector("h1").textContent;

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const index = tasks.findIndex((t) => t.title === taskTitle);
    if (index !== -1) {
      tasks[index].todos.splice(todoIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      displayToDo(tasks[index].todos);
    }

    delete_todo_modal.close();
  }
}

function openEditToDoModal(todoElement, todoIndex, todo) {
  todoElement.querySelector("#edit_to_do_task_input").value = todo.content;

  todoElement.querySelector(".to_do_wrapper").style.display = "none";
  todoElement.querySelector("#edit_to_do_elements").style.display = "flex";

  todoElement
    .querySelector("#edit_to_do_elements svg")
    .removeEventListener("click", () => {
      todoElement.querySelector(".to_do_wrapper").style.display = "flex";
      todoElement.querySelector("#edit_to_do_elements").style.display = "none";
    });

  todoElement
    .querySelector("#edit_to_do_elements svg")
    .addEventListener("click", () => {
      todoElement.querySelector(".to_do_wrapper").style.display = "flex";
      todoElement.querySelector("#edit_to_do_elements").style.display = "none";
    });

  todoElement
    .querySelector(`#edit_to_do_elements button`)
    .removeEventListener("click", () => {
      submitEditToDo(todoElement, todoIndex);
    });
  todoElement
    .querySelector(`#edit_to_do_elements button`)
    .addEventListener("click", () => {
      submitEditToDo(todoElement, todoIndex);
    });
}

function submitEditToDo(todoElement, todoIndex) {
  const newToDoContent = todoElement.querySelector(
    "#edit_to_do_task_input"
  ).value;
  const taskElement = document.querySelector(".currentTask");
  const taskTitle = taskElement.querySelector("h1").textContent;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === taskTitle);
  if (index !== -1) {
    tasks[index].todos[todoIndex].content = newToDoContent;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayToDo(tasks[index].todos);
  }

  todoElement.querySelector(".to_do_wrapper").style.display = "flex";
  todoElement.querySelector("#edit_to_do_elements").style.display = "none";
}

function displayNotes(notes) {
  const notesContainer = document.querySelector(".notes");
  notesContainer.innerHTML = "";
  notes.forEach((note, noteIndex) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.innerHTML = `
      <div class="note_content">
        <div class="note_title_actions">
          <p class="date">${note.date}</p>
          <div class="note_actions">
            <img src="/img/delete.svg" class="delete_note_btn" />
            <img src="/img/edit.svg" class="edit_note_btn" />
          </div>
        </div>
        <hr>
        <p class="note_content">${note.content}</p>
      </div>
      
    `;

    noteElement
      .querySelector(".delete_note_btn")
      .addEventListener("click", () => deleteNote(noteIndex));

    noteElement
      .querySelector(".edit_note_btn")
      .addEventListener("click", () => {
        openEditNoteModal(noteIndex, note);
      });

    notesContainer.appendChild(noteElement);
  });
}

function openEditNoteModal(noteIndex, note) {
  document.getElementById("edit_note_textarea").value = note.content;

  const editNoteModal = new WinBox("Edit note", {
    modal: true,
    mount: document.getElementById("edit_note_modal"),
    header: 50,
  });

  document
    .querySelector(`#edit_note_modal input[type="button"]`)
    .removeEventListener("click", () => {
      submitEditNote(noteIndex, editNoteModal);
    });
  document
    .querySelector(`#edit_note_modal input[type="button"]`)
    .addEventListener("click", () => {
      submitEditNote(noteIndex, editNoteModal);
    });
}

function submitEditNote(noteIndex, editNoteModal) {
  const newNoteContent = document.querySelector("#edit_note_textarea").value;
  const taskElement = document.querySelector(".currentTask");
  const taskTitle = taskElement.querySelector("h1").textContent;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === taskTitle);
  if (index !== -1) {
    tasks[index].notes[noteIndex].content = newNoteContent;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayNotes(tasks[index].notes);
  }

  editNoteModal.close();
}

function deleteNote(noteIndex) {
  const delete_note_modal = new WinBox("Delete note", {
    modal: true,
    mount: document.getElementById("delete_note_modal"),
    header: 50,
    height: 300,
  });

  document
    .querySelector("#delete_note_modal .buttons #accept")
    .removeEventListener("click", () =>
      confirmDeleteNote(noteIndex, delete_note_modal)
    );
  document
    .querySelector("#delete_note_modal .buttons #accept")
    .addEventListener("click", () =>
      confirmDeleteNote(noteIndex, delete_note_modal)
    );

  document
    .querySelector("#delete_note_modal .buttons #cancel")
    .removeEventListener("click", () =>
      closeDeleteNoteModal(delete_note_modal)
    );
  document
    .querySelector("#delete_note_modal .buttons #cancel")
    .addEventListener("click", () => closeDeleteNoteModal(delete_note_modal));

  function closeDeleteNoteModal(delete_note_modal) {
    delete_note_modal.close();
  }

  function confirmDeleteNote(noteIndex, delete_note_modal) {
    const taskElement = document.querySelector(".currentTask");
    const taskTitle = taskElement.querySelector("h1").textContent;

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const index = tasks.findIndex((t) => t.title === taskTitle);
    if (index !== -1) {
      tasks[index].notes.splice(noteIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      displayNotes(tasks[index].notes);
    }

    delete_note_modal.close();
  }
}

function updatePriority(event) {
  const newPriority = event.target.value;
  const taskElement = document.querySelector(".currentTask");
  taskElement.querySelector(".priority_container p").textContent = newPriority;
  taskElement.querySelector(
    ".priority_container img"
  ).src = `/img/flag_${newPriority}.svg`;

  const taskTitle = taskElement.querySelector("h1").textContent;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === taskTitle);
  if (index !== -1) {
    tasks[index].priority = newPriority;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function openAddNoteModal() {
  const addNoteModal = new WinBox("New note", {
    modal: true,
    mount: document.getElementById("add_note_modal"),
    header: 50,
  });

  document
    .querySelector(`#add_note_modal input[type="button"]`)
    .removeEventListener("click", () => {
      submitAddNote(addNoteModal);
    });
  document
    .querySelector(`#add_note_modal input[type="button"]`)
    .addEventListener("click", () => {
      submitAddNote(addNoteModal);
    });
}

function submitAddNote(addNoteModal) {
  const newNoteContent = document.querySelector("#add_note_textarea").value;
  const taskElement = document.querySelector(".currentTask");
  const taskTitle = taskElement.querySelector("h1").textContent;

  const date = new Date();
  const noteDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const noteTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const note = {
    date: `${noteDate} ${noteTime}`,
    content: newNoteContent,
  };

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === taskTitle);
  if (index !== -1) {
    if (!tasks[index].notes) tasks[index].notes = [];
    tasks[index].notes.push(note);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayNotes(tasks[index].notes);
  }

  document.querySelector("#add_note_textarea").value = "";
  addNoteModal.close();
}

function openEditTaskModal() {
  const taskElement = document.querySelector(".currentTask");
  const taskTitle = taskElement.querySelector("h1").textContent;
  const taskDescription = document.getElementById("description").textContent;

  document.getElementById("edit_task_title_input").value = taskTitle;
  document.getElementById("edit_task_description_textarea").value =
    taskDescription;

  const editTaskModal = new WinBox("Edit task", {
    modal: true,
    mount: document.getElementById("edit_task_modal"),
    header: 50,
  });
  const oldTaskTitle = document.querySelector("#task_title").textContent;
  if (oldTaskTitle) {
    document
      .querySelector(`#edit_task_modal input[type="button"]`)
      .removeEventListener("click", () => {
        submitEditTask(oldTaskTitle);
      });
    document
      .querySelector(`#edit_task_modal input[type="button"]`)
      .addEventListener("click", () => {
        submitEditTask(oldTaskTitle);
      });
  }
}

function submitEditTask(oldTaskTitle) {
  const taskElement = document.querySelector(".currentTask");
  const newTitle = document.getElementById("edit_task_title_input").value;
  const newDescription = document.getElementById(
    "edit_task_description_textarea"
  ).value;

  taskElement.querySelector("h1").textContent = newTitle;
  document.getElementById("task_title").textContent = newTitle;
  document.getElementById("description").textContent = newDescription;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex((t) => t.title === oldTaskTitle);
  if (index !== -1) {
    tasks[index].title = newTitle;
    tasks[index].description = newDescription;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  document.querySelector(".winbox").remove();
  location.reload();
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task, index) => {
    if (!task.notes) task.notes = [];
    addTaskFromLocalStorage(task);
    if (index === 0) {
      const firstTaskElement = document.querySelector(".task");
      firstTaskElement.classList.add("currentTask");
      firstTaskElement.click();
    }
  });
}

document.getElementById("submit_add_task_btn").addEventListener("click", () => {
  const title = document.getElementById("task_title_input").value;
  const description = document.getElementById("description_textarea").value;
  const prioritySelect = document.getElementById("add_task_priority_select");
  const priority = prioritySelect.options[prioritySelect.selectedIndex].value;
  const status = "unchecked";

  if (!title || !description) return;

  addTaskToLocalStorage(title, description, priority, status);
  addTaskFromLocalStorage({ title, description, priority, status, notes: [] });

  document.getElementById("task_title_input").value = "";
  document.getElementById("description_textarea").value = "";
  prioritySelect.selectedIndex = 0;

  location.reload();

  document.querySelector(".winbox").remove();
});

window.addEventListener("load", loadTasksFromLocalStorage);

function deleteTask(taskElement, taskTitle) {
  const delete_task_modal = new WinBox("Delete task", {
    modal: true,
    mount: document.getElementById("delete_task_modal"),
    header: 50,
    height: 300,
  });

  document
    .querySelector("#delete_task_modal .buttons #accept")
    .removeEventListener("click", confirmDeleteTask);
  document
    .querySelector("#delete_task_modal .buttons #accept")
    .addEventListener("click", () =>
      confirmDeleteTask(taskElement, taskTitle, delete_task_modal)
    );

  document
    .querySelector("#delete_task_modal .buttons #cancel")
    .removeEventListener("click", () =>
      closeDeleteTaskModal(delete_task_modal)
    );
  document
    .querySelector("#delete_task_modal .buttons #cancel")
    .addEventListener("click", () => closeDeleteTaskModal(delete_task_modal));

  function closeDeleteTaskModal(delete_task_modal) {
    delete_task_modal.close();
  }

  function confirmDeleteTask(taskElement, taskTitle, delete_task_modal) {
    taskElement.remove();

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const index = tasks.findIndex((task) => task.title === taskTitle);
    if (index !== -1) {
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    location.reload();
    const nextTaskElement = document.querySelector(".task");
    if (nextTaskElement) {
      nextTaskElement.click();
    }
    delete_task_modal.close();
  }
}

window.addEventListener("load", loadTasksFromLocalStorage);
