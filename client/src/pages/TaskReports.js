import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

function Tasks() {
    const [users, setUsers] = useState([]);
    const [assignee, setAssignee] = useState('');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState({
        projectId: '',
        assignee: '',
        targetDate: '',
        fromDate: '',
        toDate: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const { user } = useAuth();

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [usersRes, projectsRes, tasksRes] = await Promise.all([
                fetch(`http://localhost:5000/api/auth/users/`, { headers }),
                fetch(`http://localhost:5000/api/projects/${user.domain}`, { headers }),
                fetch(`http://localhost:5000/api/tasks/alltasks/${user.domain}`, { headers }),
            ]);

            setUsers(await usersRes.json());
            setProjects(await projectsRes.json());
            setTasks(await tasksRes.json());
        };

        fetchData();
    }, [user.domain]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
        if (name === 'assignee') {
            setAssignee(value);
        }
    };

    // Handle sorting
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getFormattedDateMinusOneDay = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1); // Subtract one day
        // Format the date as YYYY-MM-DD without using toISOString to avoid UTC conversion
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    const filteredTasks = tasks.filter(task => {
        // Create Date object from task's created_at and filter dates
        const taskDate = new Date(task.created_at);
        const fromDate = filter.fromDate ? new Date(filter.fromDate) : null;
        const toDate = filter.toDate ? new Date(filter.toDate) : null;
    
        // Strip the time part for comparison (set hours to 00:00)
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
    
        // Get the formatted deadline date for task comparison
        const formattedDeadlineString = task.deadline_date ? new Date(task.deadline_date).toISOString().split('T')[0] : null;
        
        // Calculate yesterday date
        const yesterdayFromDeadline = filter.toDate ? getFormattedDateMinusOneDay(filter.toDate) : null; // Calculate yesterday from the toDate
    
        return (
            (filter.projectId ? task.project_id === parseInt(filter.projectId, 10) : true) &&
            (filter.id ? task.id === parseInt(filter.id, 10) : true) &&
            (filter.priority ? task.priority === filter.priority : true) &&
            (filter.assignee ? task.user_id.split(',').includes(filter.assignee) : true) &&
            (filter.status ? task.status === filter.status : true) &&
            (filter.targetDate ? formattedDeadlineString === filter.targetDate : true) &&
            // Additional conditions for date range (fromDate to toDate)
            (!fromDate || taskDate >= fromDate) &&
            (!toDate || taskDate <= toDate) &&
            // Check for yesterday condition (from toDate)
            (filter.targetDate === "yesterday" ? formattedDeadlineString === yesterdayFromDeadline : true)
        );
    });
    

    // Sort tasks based on the sortConfig state
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;

        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
    });

    // Calculate task counts for each status
    const taskStatusCounts = filteredTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});

    // Map statuses to colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#e0f7fa'; // Light Blue
            case 'inProgress': return '#bbdefb'; // Light Yellow
            case 'completed': return '#c8e6c9'; // Light Green
            case 'cancelled': return '#ffcdd2'; // Light Red
            case 'onHold': return '#f3e5f5'; // Light Orange
            default: return '#f5f5f5'; // Default Light Gray
        }
    };
    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',  // Set A4 page format
        });
        
        const element = document.getElementById('reportContent');
        
        // Get the page width in mm (for A4, it is 210mm)
        const pageWidth = doc.internal.pageSize.width;
        
        // Get the width of the content element
        const contentWidth = element.offsetWidth;
        
        // Calculate scale factor to fit the content into the page width
        const scale = (pageWidth - 25) / contentWidth; // Subtracting 10mm for left and right margins
        
        // Set up the HTML to PDF conversion with proper scaling
        doc.html(element, {
            callback: function (doc) {
                doc.save('monthly_task_report.pdf');
            },
            margin: [10, 5, 10, 5],  // Define margins for the PDF
            x: 5,
            y: 5,
            html2canvas: {
                scale: scale,  // Dynamically set scale based on content width
                useCORS: true,  // Ensure cross-origin images work
            },
            autoPaging: true,  // Ensure content breaks across pages if needed
            maxWidth: pageWidth - 20,  // Max width for content to prevent overflow (subtract margins)
        });
    };
    
    const headers = [
        { label: "Project", key: "project_id" },
        { label: "Task Name", key: "name" },
        { label: "Task Description", key: "description" },
        { label: "Priority", key: "priority" },
        { label: "Assignee", key: "user_id" },
        { label: "Status", key: "status" },
        { label: "Created", key: "created" },
    ];
    // Reset filters to default values
    const handleResetFilters = () => {
        setFilter({
            projectId: "",
            assignee: "",
            status: "",
            fromDate: "",
            toDate: "",
        });
    };
    return (
        <div className="container">
            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label>Filter by Project</label>
                    <select
                        name="projectId"
                        value={filter.projectId}
                        onChange={handleFilterChange}
                        className="form-control"
                    >
                        <option value="">All Projects</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label>Filter by Assignee</label>
                    <select
                        name="assignee"
                        value={filter.assignee}
                        onChange={handleFilterChange}
                        className="form-control"
                    >
                        <option value="">All Assignees</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label>Filter by Status</label>
                    <select
                        name="status"
                        value={filter.status}
                        onChange={handleFilterChange}
                        className="form-control"
                    >
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="onHold">On Hold</option>
                    </select>
                </div>

                <div className="col-md-5">
                    <label>From Date</label>
                    <input
                        type="date"
                        name="fromDate"
                        value={filter.fromDate}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                </div>

                <div className="col-md-5">
                    <label>To Date</label>
                    <input
                        type="date"
                        name="toDate"
                        value={filter.toDate}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                </div>
                <div className="col-md-2">
                <label style={{opacity:0}}>Button</label>
                    <button
                        className="btn btn-secondary"
                        onClick={handleResetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div id="reportContent">
                <div style={{ marginTop: 30 }}>
                    <h4>Tasks List</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                {headers.map((header) => (
                                    <th key={header.key} onClick={() => handleSort(header.key)}>
                                        {header.label}
                                        {sortConfig.key === header.key && (
                                            <span>
                                                {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTasks.length > 0 ? (
                                sortedTasks.map(task => (
                                    <tr key={task.id} style={{ backgroundColor: getStatusColor(task.status) }}>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>
                                            {projects.find(p => p.id === parseInt(task.project_id, 10))?.name || 'N/A'}
                                        </td>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>{task.name}</td>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>{task.description}</td>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>{task.priority}</td>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>
                                            {filter.assignee ?
                                                users.find(p => p.id === parseInt(assignee, 10))?.name || 'N/A'
                                            :
                                            task.user_id
                                                .split(',')
                                                .map(id => users.find(u => u.id === parseInt(id, 10))?.name || 'N/A')
                                                .join(', ')}
                                        </td >
                                        <td style={{ backgroundColor: getStatusColor(task.status) }}>{task.status}</td>
                                        <td style={{ borderColor: getStatusColor(task.status) }}>{new Date(task.created_at).toISOString().split('T')[0]}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length}>No tasks found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card mt-4 mb-4" style={{margin:'20px 0px 0px',padding:'20px', background:'rgb(247 247 247)'}}>
                    <h5 style={{marginBottom:10}}>Task Status Report</h5>
                    <div className="card-body" style={{padding:'0px'}}>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(taskStatusCounts).map((status) => (
                                    <tr key={status}>
                                        <td style={{ backgroundColor: getStatusColor(status) }}>{status}</td>
                                        <td>{taskStatusCounts[status]}</td>
                                    </tr>
                                ))}
                                {Object.keys(taskStatusCounts).length === 0 && (
                                    <tr>
                                        <td colSpan={2}>No tasks found for the selected filters</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
                    
            <button onClick={handleDownloadPDF} className="btn btn-primary my-4">
                Download Report
            </button>
        </div>
    );
}

export default Tasks;
