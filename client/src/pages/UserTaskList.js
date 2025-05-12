// src/pages/UserTasks.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomTable from '../components/Table';

function UserTasks() {
    const { projectId } = useParams(); 
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState({
        id: '',
        priority: '',
        status: '',
        targetDate: '',
        assignedBy: '' 
    });

    // Reset filters to default values
    const handleResetFilters = () => {
        setFilter({
            id: '',
            priority: '',
            status: '',
            targetDate: '',
            assignedBy: '' 
        });
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
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
            (filter.id ? task.id === parseInt(filter.id, 10) : true) &&
            (filter.priority ? task.priority === filter.priority : true) &&
            (filter.status ? task.status === filter.status : true) &&
            (filter.targetDate ? formattedDeadlineString === filter.targetDate : true) && // Filter by selected target date
            (filter.targetDate === "yesterday" ? formattedDeadlineString === yesterdayFromDeadline : true) // Additional condition for yesterday
        );
    });   
    

    useEffect(() => {
        const fetchUserTasks = async () => {
        
            const response = await fetch(`http://localhost:5000/api/tasks/usertasks/${user.id}?projectId=${projectId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            
            const taskData = await response.json();
            setTasks(taskData);
        };
        fetchUserTasks();
        
        const fetchProjects = async () => {
            const response = await fetch(`http://localhost:5000/api/projects/byid/${user.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setProjects(data);
        };
        fetchProjects();
    }, [user.id, projectId]);

    const handleStatusChange = (taskId, newStatus) => {
        setTasks(prevTasks =>
            prevTasks.map(task => (task.id === taskId ? { ...task, status: newStatus } : task))
        );
    };

    const handleNotesChange = (taskId, newNotes) => {
        setTasks(prevTasks =>
            prevTasks.map(task => (task.id === taskId ? { ...task, notes: newNotes } : task))
        );
    };

    const handleUpdate = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
    
        // Ensure task data is available
        if (!task) {
            console.error("Task not found");
            return;
        }
    
        // Prepare the updated task data to be sent in the body of the request
        const updatedTaskData = {
            name: task.name,
            userId: task.user_id, // Make sure this is the correct field name for user_id
            projectId: projectId, // Make sure this is the correct field name for project_id
            description: task.description,
            status: task.status,
            updated_user: user.id,
            deadlineDate: task.deadline_date, // Assuming deadline_date is the correct field name
            notes: task.notes,
            priority: task.priority,
            assigning: task.assigning, // If assigning is available in task object
            domain: user.domain, 
        };
    
        // Send the updated task data to the server
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify(updatedTaskData), // Pass all the fields here
        });
    
        if (!response.ok) {
            console.error("Failed to update task");
        } else {
            window.location.reload();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);  // Add one day to the date
        return date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
    };
    const headers = ["Task Details", "Priority", "Assigned By", "Target Date & Time", "Status", 'Comment', "Actions"];

    const getStatusBackgroundColor = (status) => {
        const statusColors = {
            completed: '#c8e6c9',    // Green for completed
            inProgress: '#bbdefb',   // Yellow for in progress
            cancelled: '#ffcdd2', // Red for cancelled
            onHold: '#f3e5f5',      // Red for pending
            new: '#e0f7fa'          // Default for new tasks
        };
        return statusColors[status] || 'white'; // Default to white for other statuses
    };
    
    const renderRow = (task) => (
        <tr key={task.id}>
            {[
                { content: <><b>{task.name}</b><br />{task.description}</> },
                { content: task.priority },
                { content: task.assigning },
                { content: <>{formatDate(task.deadline_date)}<br />{task.time}</> },
                {
                    content: (
                        <select
                            value={task.status}
                            className="form-control"
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="new">New</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="onHold">On Hold</option>
                        </select>
                    ),
                },
                {
                    content: (
                        <textarea
                            value={task.notes || ''}
                            onChange={(e) => handleNotesChange(task.id, e.target.value)}
                            style={{ width: '100%' }}
                            placeholder="Enter notes"
                            className="form-control"
                        />
                    ),
                },
                {
                    content: (
                        <button
                            onClick={() => handleUpdate(task.id)}
                            className="btn btn-primary"
                            disabled={task.status_id === 1}
                        >
                            Update
                        </button>
                    ),
                },
            ].map((cell, index) => (
                <td
                    key={index}
                    style={{
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        // Apply background color only for the status column (index 5)
                        backgroundColor: index === 4 ? getStatusBackgroundColor(task.status) : 'white',
                    }}
                >
                    {cell.content}
                </td>
            ))}
        </tr>
    );
    

    return (
        <div className='container'>
            <h2>Tasks For {projects.find(u => u.id === parseInt(projectId, 10))?.name || 'N/A' } Project</h2>
            <div className="row mb-3">
                <div className="col-md-4">
                <label>Filter by Task</label>
                    <select 
                        name="id" 
                        value={filter.id} 
                        onChange={handleFilterChange} 
                        className="form-control"
                    >
                        <option value="">All Tasks</option>
                        {tasks
                            .filter(task => task.project_id === parseInt(projectId, 10)) // Filter tasks by selected project
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
                <div className="col-md-4">
                    <label>Filter by Status</label>
                    <select name="status" value={filter.status} onChange={handleFilterChange} className="form-control">
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="onHold">On Hold</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label>Filter by Assigned By</label>
                    <select 
                        name="assignedBy" 
                        value={filter.assignedBy} 
                        onChange={handleFilterChange} 
                        className="form-control"
                    >
                        <option value="">All Assigners</option>
                        {[...new Set(tasks.map(task => task.assigning))] // Extract unique assigners
                            .map(assigner => (
                                <option key={assigner} value={assigner}>{assigner}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="col-md-4">
                    <label>Filter by Target Date</label>
                    <input
                        type="date"
                        name="targetDate"
                        value={filter.targetDate}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label style={{opacity:0}}>Button</label>
                    <button
                        className="btn btn-secondary"
                        onClick={handleResetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
            {tasks.length === 0 ? (
                <p>No tasks found</p>
            ) : (
                <CustomTable 
                    headers={headers} 
                    data={filteredTasks} 
                    renderRow={renderRow} 
                />
            )}
        </div>
    );
}

export default UserTasks;
