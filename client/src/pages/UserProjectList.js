// src/pages/UserProjects.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // For linking to user tasks page

function UserProjects() {
    const { user } = useAuth();  // Get the logged-in user from Auth context
    const [projects, setProjects] = useState([]);  // State to store all projects
    const [filteredProjects, setFilteredProjects] = useState([]);  // State to store filtered projects
    const [searchQuery, setSearchQuery] = useState('');  // State to store search query
    const [tasksData, setTasksData] = useState({}); // Store task counts and statuses for each project

    // Fetch projects assigned to the logged-in user
    useEffect(() => {
        // Fetch tasks for a specific project
        const fetchTasksForProject = async (projectId) => {
            const response = await fetch(`https://timetrackingapp.onrender.com/api/tasks/usertasks/${user.id}?projectId=${projectId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const tasks = await response.json();

            // Count the task statuses (e.g., Pending, In Progress, Completed)
            const taskCounts = tasks.reduce(
                (counts, task) => {
                    counts.total += 1;
                    if (task.status === 'new') counts.new += 1;
                    if (task.status === 'inProgress') counts.inProgress += 1;
                    if (task.status === 'completed') counts.completed += 1;
                    if (task.status === 'onHold') counts.onHold += 1;
                    if (task.status === 'cancelled') counts.cancelled += 1;
                    return counts;
                },
                { total: 0, new: 0, inProgress: 0, completed: 0 }
            );

            // Store the task counts for the project
            setTasksData((prevData) => ({
                ...prevData,
                [projectId]: taskCounts,
            }));
        };
        const fetchProjects = async () => {
            const response = await fetch(`https://timetrackingapp.onrender.com/api/projects/byid/${user.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setProjects(data);
            setFilteredProjects(data);  // Initially, show all projects

            // Fetch tasks for each project to get counts
            data.forEach((project) => {
                fetchTasksForProject(project.id);
            });
        };
        fetchProjects();
    }, [user.id]);  // Add fetchTasksForProject to the dependency array


    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter the projects based on the search query
        if (query) {
            const filtered = projects.filter(project =>
                project.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredProjects(filtered);
        } else {
            setFilteredProjects(projects);  // Reset to all projects if the search is cleared
        }
    };

    return (
        <div className="container">
            <h2>Your Projects</h2>

            {/* Search bar for project name */}
            <div className="row mb-3">
                <div className="col-md-12">
                    <label>Search by Project Name</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="form-control"
                        placeholder="Search for a project..."
                    />
                </div>
            </div>

            {/* Grid layout for displaying projects */}
            <div className="row">
                {filteredProjects.filter(project => {
                    const taskCounts = tasksData[project.id] || {};
                    return (taskCounts.total || 0) > 0; // Only include projects with tasks
                }).length === 0 ? (
                    // If no projects with tasks, show this message
                    <div className="col-md-12">
                        <p className="text-center text-muted">No projects found for assigned tasks</p>
                    </div>
                ) : (
                    // Otherwise, display the projects with tasks
                    filteredProjects.filter(project => {
                        const taskCounts = tasksData[project.id] || {};
                        return (taskCounts.total || 0) > 0;
                    }).map((project) => {
                        const taskCounts = tasksData[project.id] || {};
                        const totalTasks = taskCounts.total || 0;

                        return (
                            <div className="col-md-12" key={project.id}>
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h3 className="">{project.name}</h3>
                                        <p className="card-text">{project.description}</p>

                                        {/* Task and status counts */}
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title">Task Summary</h5>
                                            </div>

                                            <p><strong>Total Tasks:</strong> {totalTasks}</p>

                                            <div className="row">
                                                {/* New Task */}
                                                <div className="col-3-taskgrid">
                                                    <div className="card p-3 bg-light text-center">
                                                        <i className="bi bi-file-earmark-text fs-4 text-primary"></i>
                                                        <p style={{ margin: 0 }}><strong>New</strong></p>
                                                        <p style={{ margin: 0 }}>{taskCounts.new || 0}</p>
                                                    </div>
                                                </div>

                                                {/* In Progress Task */}
                                                <div className="col-3-taskgrid">
                                                    <div className="card p-3 bg-warning text-center">
                                                        <i className="bi bi-hourglass-split fs-4 text-warning"></i>
                                                        <p style={{ margin: 0 }}><strong>In Progress</strong></p>
                                                        <p style={{ margin: 0 }}>{taskCounts.inProgress || 0}</p>
                                                    </div>
                                                </div>

                                                {/* Completed Task */}
                                                <div className="col-3-taskgrid">
                                                    <div className="card p-3 bg-success text-center">
                                                        <i className="bi bi-check-circle fs-4 text-success"></i>
                                                        <p style={{ margin: 0 }}><strong>Completed</strong></p>
                                                        <p style={{ margin: 0 }}>{taskCounts.completed || 0}</p>
                                                    </div>
                                                </div>

                                                {/* On Hold Task */}
                                                <div className="col-3-taskgrid">
                                                    <div className="card p-3 bg-secondary text-center">
                                                        <i className="bi bi-pause-circle fs-4 text-dark"></i>
                                                        <p style={{ margin: 0 }}><strong>On Hold</strong></p>
                                                        <p style={{ margin: 0 }}>{taskCounts.onHold || 0}</p>
                                                    </div>
                                                </div>

                                                {/* Cancelled Task */}
                                                <div className="col-3-taskgrid">
                                                    <div className="card p-3 bg-danger text-center">
                                                        <i className="bi bi-x-circle fs-4 text-danger"></i>
                                                        <p style={{ margin: 0 }}><strong>Cancelled</strong></p>
                                                        <p style={{ margin: 0 }}>{taskCounts.cancelled || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/user-tasks/${project.id}`}
                                            className="btn btn-primary"
                                            style={{ pointerEvents: totalTasks === 0 ? 'none' : 'auto', opacity: totalTasks === 0 ? 0.5 : 1 }}
                                        >
                                            View Tasks
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}

export default UserProjects;
