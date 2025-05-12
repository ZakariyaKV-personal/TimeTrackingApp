import React, { useState, useEffect } from 'react';
import CustomTable from '../components/Table'; // Adjust the import path if needed
import { useAuth } from '../context/AuthContext';

function Tasks() {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [domain, setDomian] = useState('');
    const [tasks, setTasks] = useState([]);
    const [names, setName] = useState('');
    const [filteredAssignees, setFilteredAssignees] = useState([]);
    const [filter, setFilter] = useState({
        projectId: '',
        id: '',
        priority: '',
        assignee: '',
        status: '',
        targetDate: ''
    });
    const { user } = useAuth();
    const [newTask, setNewTask] = useState({
        id: '', name: '', projectId: '', userId: '', status: '', 
        description: '', priority: '', deadlineDate: '', time: '', assigning: '', domain: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
    };
    
    // Reset filters to default values
    const handleResetFilters = () => {
        setFilter({
            projectId: '',
            id: '',
            priority: '',
            assignee: '',
            status: '',
            targetDate: ''
        });
    };
    const getFormattedDateMinusOneDay = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1); // Subtract one day
        // Format the date as YYYY-MM-DD without using toISOString to avoid UTC conversion
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    const filteredTasks = tasks.filter(task => {
        const formattedDeadline = new Date(task.deadline_date);
        const formattedDeadlineString = `${formattedDeadline.getFullYear()}-${(formattedDeadline.getMonth() + 1).toString().padStart(2, '0')}-${formattedDeadline.getDate().toString().padStart(2, '0')}`; // Format task deadline to YYYY-MM-DD
    
        const yesterdayFromDeadline = getFormattedDateMinusOneDay(task.deadline_date); // Calculate yesterday from the task's deadline
        
        return (
            (filter.projectId ? task.project_id === parseInt(filter.projectId, 10) : true) &&
            (filter.id ? task.id === parseInt(filter.id, 10) : true) &&
            (filter.priority ? task.priority === filter.priority : true) &&
            (filter.status ? task.status === filter.status : true) &&
            (filter.targetDate ? formattedDeadlineString === filter.targetDate : true) && // Filter by selected target date
            (filter.targetDate === "yesterday" ? formattedDeadlineString === yesterdayFromDeadline : true) // Additional condition for yesterday
        );
    });   

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch(`http://localhost:5000/api/auth/users/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const userData = await response.json();
            setUsers(userData);
        };
        
        const fetchProjects = async () => {
            const response = await fetch(`http://localhost:5000/api/projects/${user.domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const projectData = await response.json();
            setProjects(projectData);
        };

        const fetchTasks = async () => {
            const response = await fetch(`http://localhost:5000/api/tasks/alltasks/${user.domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const taskData = await response.json();
            setTasks(taskData);
        };

        fetchProjects();
        fetchTasks();
        setDomian(user.domain);
        setName(user.name);
        fetchUsers();
    }, [user.domain, user.name]);

    const handleTaskChange = (e) => {
        const { name, value, options } = e.target;
    
    // For multi-select, get all selected options
    if (e.target.multiple) {
        const selectedValues = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);

        setNewTask({
            ...newTask,
            [name]: selectedValues,  // Store array of selected values
            assigning: user ? names : '',
            domain: user ? domain : '', // Store the user name in the 'assigning' field
        });
    } else {
        setNewTask({
            ...newTask,
            [name]: value,
            assigning: user ? names : '',
            domain: user ? domain : '', // Store the user name in the 'assigning' field
        });
    }
    };
    const setFilteredAssignee = (projectId) => {    
        // Step 1: Filter the projects to get the selected project
        const selectedProject = projects.find((project) => project.id === parseInt(projectId, 10));
    
        if (selectedProject) {
            // Step 2: Get the users_ids from the selected project
            const projectUsersIds = selectedProject.users_id;
            // Step 3: Filter the users list based on the users_id array
            const filteredUsers = users.filter((user) => projectUsersIds.includes(user.id));
            // Step 4: Set the filtered users to state
            setFilteredAssignees(filteredUsers);
        } else {
            setFilteredAssignees([]);
        }
    };
    
    
    const handleAddTask = async (e) => {
        e.preventDefault();  // Prevent the page from refreshing
        if (isEditing) {
            await handleUpdateTask(newTask.id);
        } else {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error("Failed to add task");
            }
        }
    };

    const handleUpdateTask = async (taskId) => {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(newTask),
        });

        if (response.ok) {
            window.location.reload();
        } else {
            console.error("Failed to update task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (response.ok) {
            setTasks(tasks.filter(task => task.id !== taskId));
        } else {
            console.error("Failed to delete task");
        }
    };
    

    const handleEditTask = (task) => {
        setIsEditing(true);
        setNewTask({
            id: task.id,
            name: task.name,
            userId: setFilteredAssignee(task.project_id),  // Ensure this is the correct field for user ID
            projectId: task.project_id,
            status: task.status,
            description: task.description,
            deadlineDate: formatDate(task.deadlineDate),
            time: task.time,
            priority: task.priority,
            assigning: user.name,
            domain: user.domain,
        });
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);  // Add one day to the date
        return date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
    };
    
    // Define table headers
    const headers = ["Project", "Task Details", "Priority", "Assignee", "Target Date & Time", "Status", "Actions"];

    const renderRow = (task) => {
        const rowClass = `status-${task.status}`; // Dynamically create the class name based on the status
    
        return (
            <tr key={task.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>
                    {projects.find(p => p.id === parseInt(task.project_id, 10))?.name || 'N/A'}
                </td>
                <td style={{ padding: '8px' }}><b>{task.name}</b><br />{task.description}</td>
                <td style={{ padding: '8px' }}>{task.priority}</td>
                <td style={{ padding: '8px' }}>
                    {task.user_id
                        .split(',')
                        .map(id => users.find(u => u.id === parseInt(id, 10))?.name || 'N/A')
                        .join(', ')}
                </td>
                <td style={{ padding: '8px' }}>{formatDate(task.deadline_date)}<br />{task.time}</td>
                <td style={{ padding: '8px' }}  className={rowClass}>{task.status}</td>
                <td style={{ padding: '8px' }}>
                    <button onClick={() => handleEditTask(task)} style={{ marginRight: 10 }} className='btn btn-primary'>Edit</button>
                    <button onClick={() => handleDeleteTask(task.id)} className='btn btn-danger'>Delete</button>
                </td>
            </tr>
        );
    };

    return (
        <div className='container'>
            <form onSubmit={handleAddTask} className='row'>
                <div className='col-md-12'>
                    <h4>{isEditing ? "Edit Task" : "Create a New Task"}</h4>
                </div>
                <div className='col-md-6'>
                    <label>Task Name</label>
                    <input
                        type="text"
                        name="name"
                        className='form-control'
                        placeholder="Task name"
                        value={newTask.name}
                        onChange={handleTaskChange}
                        required
                    />
                </div>

                <div className='col-md-6'>
                    <label>Project</label>
                    <select name="projectId" className='form-control' value={newTask.projectId} 
                        onChange={(e) => {
                            handleTaskChange(e); // Updates the projectId in the newTask state
                            setFilteredAssignee(e.target.value); // Filters the assignees based on the selected project
                        }}
                        required>
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='row' style={{margin:'0px',padding:0 }}>
                    <div className='col-md-6'>
                        <div className="col-md-12">
                            <label>Assignees</label>
                            <select
                                name="userId"
                                className="form-control"
                                value={newTask.userId || []} // Default to an empty array for multi-select
                                onChange={handleTaskChange}
                                multiple // Enable multiple selections
                                style={{ height: 130 }}
                            >
                                <option value="" style={{ background: "#f1f1f1", padding: 5 }}>
                                    Select Assignees
                                </option>
                                {filteredAssignees.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                        style={{
                                            borderBottom: "1px solid rgb(219 219 219)",
                                            padding: 5,
                                        }}
                                    >
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='col-md-12'>
                            <label>Target Date</label>
                            <input
                                type="date"
                                name="deadlineDate"
                                className='form-control'
                                value={newTask.deadlineDate}
                                onChange={handleTaskChange}
                                required
                            />
                        </div>
                        <div className='col-md-12'>
                            <label>Target Time</label>
                            <input
                                type="time"
                                name="time"
                                className='form-control'
                                value={newTask.time}
                                onChange={handleTaskChange}
                                required
                            />
                        </div>
                    </div>
                </div>


                <div className='col-md-6'>
                    <label>Status</label>
                    <select name="status" className='form-control' value={newTask.status} onChange={handleTaskChange} required>
                        <option value="">Select Status</option>
                        <option value="new">New</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="onHold">On Hold</option>
                    </select>
                </div>

                <div className='col-md-6'>
                    <label>Priority</label>
                    <select name="priority" className='form-control' value={newTask.priority} onChange={handleTaskChange} required>
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>


                <div className='col-md-12'>
                    <label>Description</label>
                    <textarea
                        name="description"
                        className='form-control'
                        placeholder='Description'
                        value={newTask.description}
                        onChange={handleTaskChange}
                        style={{ margin: '0px 0px 10px' }}
                        required
                    />
                </div>

                <div className='col-md-12'>
                    <button >{isEditing ? "Update Task" : "Add Task"}</button>
                </div>
            </form>

            <div style={{ marginTop: 30 }}>
                <h4>Tasks List</h4>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label>Filter by Project</label>
                        <select name="projectId" value={filter.projectId} onChange={handleFilterChange} className="form-control">
                            <option value="">All Projects</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                    <label>Filter by Task</label>
                        <select 
                            name="id" 
                            value={filter.id} 
                            onChange={handleFilterChange} 
                            className="form-control"
                            disabled={!filter.projectId} // Disable if no project is selected
                        >
                            <option value="">All Tasks</option>
                            {tasks
                                .filter(task => !filter.projectId || task.project_id === parseInt(filter.projectId, 10)) // Filter tasks by selected project
                                .map(task => (
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label>Filter by Priority</label>
                        <select name="priority" value={filter.priority} onChange={handleFilterChange} className="form-control">
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label>Filter by Assignee</label>
                        <select name="assignee" value={filter.assignee} onChange={handleFilterChange} className="form-control">
                            <option value="">All Assignees</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label>Filter by Status</label>
                        <select name="status" value={filter.status} onChange={handleFilterChange} className="form-control">
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="onHold">On Hold</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label>Filter by Target Date</label>
                        <input
                            type="date"
                            name="targetDate"
                            value={filter.targetDate}
                            onChange={handleFilterChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <label style={{opacity:0}}>Button</label>
                        <button
                            className="btn btn-secondary"
                            onClick={handleResetFilters}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
                {tasks.length > 0 ? (
                    <CustomTable
                        headers={headers}
                        data={filteredTasks}
                        renderRow={renderRow}
                        columnWidths={['15%', '25%', '10%', '15%', '10%', '10%', '15%']}
                    />
                ) : (
                    <p>No tasks available.</p>
                )}
            </div>
        </div>
    );
}

export default Tasks;
