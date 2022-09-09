// DOM variables
var sparklesEl = document.querySelector('h1 span');
var mainEl = document.querySelector('main');
var formEl = document.querySelector('form');
var inputTaskNameEl = document.querySelector("input[name='task-name']");
var inputTaskTypeEl = document.querySelector("input[name='task-type']");
var tasksToDoListEl = document.querySelector('#tasks-to-do');
var tasksInProgressListEl = document.querySelector('#tasks-in-progress');
var tasksCompletedListEl = document.querySelector('#tasks-completed');

// Global variables
var colorLoop = false;
var colorThemes = [
	{
		dark: '#2a324b',
		light: '#f4f4f9',
		accent: '#f9f65f',
	},
	{
		dark: '#004e64',
		light: '#f6f1d1',
		accent: '#f52f57',
	},
	{
		dark: '#0d5c63',
		light: '#fffffa',
		accent: '#c4fff9',
	},
	{
		dark: '#011627',
		light: '#fdfffc',
		accent: '#ff9f1c',
	},
];
var colorThemeIdx = 0;
var colorThemeTimer; // declare timer
var colorTimeInterval = 3000; // time interval for displaying color themes, in milliseconds

var tasks; // this will be an array to hold our tasks and make them available globally
var taskIdTracker; // this will keep track of the next id number available for a new task being created

// Function to trigger actions to take when page loads
function init() {
	// Retrieve our array of tasks from local storage
	tasks = JSON.parse(localStorage.getItem('tasks'));

	// If there are no tasks, exit the function
	if (!tasks) {
		console.log('There were no tasks saved in local storage.');
		// initialize tasks array and taskIdTracker
		tasks = [];
		taskIdTracker = 0;
		return;
	}

	// Loop through our array of retrieved tasks and display each task in its correct container depending on its status. Also, initialize 'taskIdTracker' to the next number available.
	// Initialize taskIdTracker to the id of the first task found in the tasks array
	taskIdTracker = tasks[0].id;
	// Loop through the tasks array
	for (var i = 0; i < tasks.length; i++) {
		// Pass each task into the 'displayTask' function
		displayTask(tasks[i]);
		// Check if that task's id is higher than the number currently held in taskIdTracker and update accordingly
		if (tasks[i].id > taskIdTracker) {
			taskIdTracker = tasks[i].id;
		}
	}
	// Set 'taskIdTracker' to the next available id number
	taskIdTracker++;
}

init();

/***************************/
/***** Event listeners *****/
/***************************/

// Function to handle a form submission
function taskFormHandler(event) {
	event.preventDefault();

	// Retrieve value from input elements
	var taskName = inputTaskNameEl.value.trim();
	var taskType = inputTaskTypeEl.value.trim();

	// Verify that user provided a task name and a task type
	if (!taskName || !taskType) {
		alert('Please provide both a task name and a task type.');
		return;
	}

	// Check if we are editing an existing task or creating a new class by verifying if the form as a data-taskId attribute attached to it
	var formHasDataTaskIdAttribute = formEl.hasAttribute('data-taskId'); // returns a boolean

	if (formHasDataTaskIdAttribute) {
		var taskId = formEl.getAttribute('data-taskId');
		// Create updated task object
		var updatedTaskObj = {
			id: taskId,
			name: taskName,
			type: taskType,
		};
		finishEditTaskInfo(updatedTaskObj);
	} else {
		// Create new task object
		var newTaskObj = {
			id: taskIdTracker,
			name: taskName,
			type: taskType,
			status: 'To Do',
		};
		createTask(newTaskObj);
	}

	// Reset form fields
	inputTaskNameEl.value = '';
	inputTaskTypeEl.value = '';
}

// Function to handle a click on a either a task 'edit' or 'delete' button
function taskButtonHandler(event) {
	// Get target element from click event
	var targetEl = event.target;

	// If the element matches the CSS selector '.editBtn', call the editTask function
	if (targetEl.matches('.editBtn')) {
		var taskId = targetEl.getAttribute('data-taskid');
		startEditTaskInfo(taskId);
	}
	// If the element matches the CSS selector '.deleteBtn', call the deleteTask function
	else if (targetEl.matches('.deleteBtn')) {
		var taskId = targetEl.getAttribute('data-taskid');
		deleteTask(taskId);
	}
}

// Function to change page color theme every 5s
function changeColorTheme() {
	// Get the root element
	var rootEl = document.querySelector(':root');

	// Reset colorThemeIdx to 0 if we have reached the end of our 'colorThemes' array
	if (colorThemeIdx === colorThemes.length) {
		colorThemeIdx = 0;
	}
	// Change color properties
	rootEl.style.setProperty('--dark', colorThemes[colorThemeIdx].dark);
	rootEl.style.setProperty('--light', colorThemes[colorThemeIdx].light);
	rootEl.style.setProperty('--accent', colorThemes[colorThemeIdx].accent);

	// Increment colorThemeIdx to go to the next color
	colorThemeIdx++;
}

// Listen for form submission event
formEl.addEventListener('submit', taskFormHandler);

// Listen for click event on 'Edit' or 'Delete' buttons
mainEl.addEventListener('click', taskButtonHandler);

// Listen for change event on task status dropdown
mainEl.addEventListener('change', changeTaskStatus);

// Listen for click event on sparkles emoji
sparklesEl.addEventListener('click', function () {
	// Toggle change color theme
	colorLoop = !colorLoop;

	if (colorLoop) {
		changeColorTheme();
		// Set up timer to change color theme every 'colorTimeInterval'
		colorThemeTimer = setInterval(changeColorTheme, colorTimeInterval);
	} else {
		clearInterval(colorThemeTimer);
	}
});

/****************************/
/****** CRUD functions ******/
/****************************/
// CRUD: Create, Read, Update, Delete

// CREATE
// Function to create a new task
function createTask(newTask) {
	// Display the new task in the 'Tasks To Do' section
	displayTask(newTask);

	// Save the new task
	tasks.push(newTask);
	localStorage.setItem('tasks', JSON.stringify(tasks));

	// Increase taskIdTracker for next unique task id
	taskIdTracker++;
}

// READ
// Function to display a task into its correct section
function displayTask(task) {
	// Create a 'li' element for the task to be displayed
	var taskListItemEl = document.createElement('li');
	taskListItemEl.setAttribute('class', 'task-item');
	taskListItemEl.setAttribute('data-taskId', task.id);

	// Create and append task information to the li element
	var taskInfoEl = document.createElement('div');
	taskInfoEl.innerHTML =
		'<h3 class="task-name">' +
		task.name +
		'</h3><span class="task-type"> - ' +
		task.type +
		'</span>';
	taskListItemEl.appendChild(taskInfoEl);

	// Create and append task actions to the li element
	var taskActionsEl = document.createElement('div');
	taskActionsEl.setAttribute('class', 'task-actions');
	taskListItemEl.appendChild(taskActionsEl);
	// Create edit button
	var editTaskEl = document.createElement('button');
	editTaskEl.textContent = 'Edit';
	editTaskEl.setAttribute('class', 'editBtn');
	editTaskEl.setAttribute('data-taskId', task.id);
	taskActionsEl.appendChild(editTaskEl);
	// Create delete button
	var deleteTaskEl = document.createElement('button');
	deleteTaskEl.textContent = 'Delete';
	deleteTaskEl.setAttribute('class', 'deleteBtn');
	deleteTaskEl.setAttribute('data-taskId', task.id);
	taskActionsEl.appendChild(deleteTaskEl);
	// Create change task status dropdown
	var selectTaskStatusEl = document.createElement('select');
	selectTaskStatusEl.setAttribute('name', 'task-status');
	selectTaskStatusEl.setAttribute('data-taskId', task.id);
	taskActionsEl.appendChild(selectTaskStatusEl);
	// Create task status options
	var statusOptions = ['To Do', 'In Progress', 'Completed'];
	for (var i = 0; i < statusOptions.length; i++) {
		var statusOptionEl = document.createElement('option');
		statusOptionEl.setAttribute('value', statusOptions[i]);
		statusOptionEl.textContent = statusOptions[i];
		selectTaskStatusEl.appendChild(statusOptionEl);
	}

	// Append the new list item to the correct ul (is it the ul located in the 'Tasks To Do' section, the 'Tasks In Progress' section, or the 'Tasks Completed' section?)
	if (task.status === 'To Do') {
		selectTaskStatusEl.selectedIndex = 0;
		tasksToDoListEl.appendChild(taskListItemEl);
	} else if (task.status === 'In Progress') {
		selectTaskStatusEl.selectedIndex = 1;
		tasksInProgressListEl.appendChild(taskListItemEl);
	} else if (task.status === 'Completed') {
		selectTaskStatusEl.selectedIndex = 2;
		tasksCompletedListEl.appendChild(taskListItemEl);
	} else {
		alert('Oops, something went wrong!');
	}
}

// UPDATE
// Functions to edit a task's name and type
// Set the task to be edited into the form
function startEditTaskInfo(taskId) {
	// Find the corresponding li element
	var selectedTask = document.querySelector(
		'.task-item[data-taskId="' + taskId + '"]'
	);

	// Get the task name
	var selectedTaskName = selectedTask.querySelector('.task-name').textContent;

	// Get the task type
	var selectedTaskType = selectedTask
		.querySelector('.task-type')
		.textContent.split(' ')
		.slice(2)
		.join(' ');

	// Write selectedTaskName and selectedTaskType as values of their respective 'input' element in our form
	inputTaskNameEl.value = selectedTaskName;
	inputTaskTypeEl.value = selectedTaskType;

	// Set data attribute to the form with a value of 'taskId' so we keep track of which task we are editing
	formEl.setAttribute('data-taskId', taskId);

	// Update form's button to reflect editing a task rather than creating a new one
	formEl.querySelector('button').textContent = 'Save Task';
}
// Save the updated task
function finishEditTaskInfo(updatedTask) {
	// Find the li with the data-taskId of the updatedTask
	var listItemToUpdate = document.querySelector(
		'.task-item[data-taskId="' + updatedTask.id + '"]'
	);

	// Set the updated values
	listItemToUpdate.querySelector('.task-name').textContent = updatedTask.name;
	listItemToUpdate.querySelector('.task-type').textContent =
		'- ' + updatedTask.type;

	// Update the tasks array - Loop through it to find the correct task to update
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id == updatedTask.id) {
			tasks[i].name = updatedTask.name;
			tasks[i].type = updatedTask.type;
		}
	}

	// Remove data attribute from form
	formEl.removeAttribute('data-taskId');
	// Change back form button to say 'Add Task'
	formEl.querySelector('button').textContent = 'Add Task';

	// Save updated tasks array to local storage
	localStorage.setItem('tasks', JSON.stringify(tasks));
}
// Edit a task' status
function changeTaskStatus(event) {
	var targetEl = event.target;

	// Get new status selected by user
	var newStatus = targetEl.value;

	// Find the task list item based on the event.target's data-taskId attribute
	var taskId = targetEl.getAttribute('data-taskid');
	var selectedTask = document.querySelector(
		'.task-item[data-taskId="' + taskId + '"]'
	);

	// Move task to its correct container
	if (newStatus === 'To Do') {
		tasksToDoListEl.appendChild(selectedTask);
	} else if (newStatus === 'In Progress') {
		tasksInProgressListEl.appendChild(selectedTask);
	} else if (newStatus === 'Completed') {
		tasksCompletedListEl.appendChild(selectedTask);
	} else {
		alert('Oops, something went wrong!');
	}

	// Update task'status in tasks array
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id == taskId) {
			tasks[i].status = newStatus;
		}
	}

	// Save updated tasks to local storage
	localStorage.setItem('tasks', JSON.stringify(tasks));
}

// DELETE
// Function to delete a task
function deleteTask(taskId) {
	// Find the corresponding li element
	var selectedTask = document.querySelector(
		'.task-item[data-taskId="' + taskId + '"]'
	);
	selectedTask.remove();

	// Update our array of tasks
	var updatedTaskArr = []; // will hold our updated list of tasks
	for (var i = 0; i < tasks.length; i++) {
		// if tasks[i].id doesn't match the value of taskId, keep that task and push it in the updatedTaskArr
		if (tasks[i].id != taskId) {
			updatedTaskArr.push(tasks[i]);
		}
	}
	// Reassign tasks array to be the same as updatedTaskArr
	tasks = updatedTaskArr;

	// Save the updated array of tasks to local storage
	localStorage.setItem('tasks', JSON.stringify(tasks));
}
