import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const {user} = useAuth();
    const [reports, setReports] = useState([]);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [selectedUser, setSelectedUser] = useState(''); // User selection state
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]); // Store list of users

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setUsers(data);
        };

        const fetchProjects = async () => {
            const response = await fetch(`http://localhost:5000/api/projects/${user.domain}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setProjects(data);
        };

        fetchUsers();
        fetchProjects();
    }, [user.domain]);
    
    // Filter reports based on selected user and project
    const filteredReports = reports.filter((entry) => {        
        if (!selectedProject) return true;
        return entry.project === selectedProject; // Use the correct key
    });
    
    useEffect(() => {
        const fetchReports = async () => {
            if (month && year && selectedUser) {
                const response = await fetch(`http://localhost:5000/api/reports?month=${month}&year=${year}&user=${selectedUser}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                });
                const data = await response.json();
                setReports(data);
            }
        };
        fetchReports();
    }, [month, year, selectedUser]);

    const handleFetchReports = async (e) => {
        e.preventDefault();
        if (selectedUser) {
            const response = await fetch(`http://localhost:5000/api/reports?month=${month}&year=${year}&user=${selectedUser}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setReports(data);
        }
    };

    // Calculate total hours from start and end times
    const calculateTotalHours = (startTime, endTime) => {
        const start = new Date(`1970-01-01T${startTime}Z`);
        const end = new Date(`1970-01-01T${endTime}Z`);
        const diffInMs = end - start; // Difference in milliseconds
        const hours = diffInMs / 1000 / 60 / 60; // Convert to hours
        return hours;
    };

    // Group by date and project while calculating total hours for each project per date
    const groupedReports = filteredReports.reduce((acc, entry) => {
        const dateObj = new Date(entry.date);
        const date = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;

        entry.entries.forEach((task) => {
            const taskHours = calculateTotalHours(task.start_time, task.end_time);
            if (isNaN(taskHours)) return;

            if (!acc[date]) acc[date] = [];

            const projectIndex = acc[date].findIndex(project => project.name === entry.project);
            if (projectIndex === -1) {
                acc[date].push({ name: entry.project, tasks: [{ ...task, totalHours: taskHours }] });
            } else {
                acc[date][projectIndex].tasks.push({ ...task, totalHours: taskHours });
            }
        });

        return acc;
    }, {});

    // Calculate total hours for the entire month
    const totalHoursForMonth = reports.reduce((acc, entry) => {
        let totalHours = 0;
        entry.entries.forEach((task) => {
            totalHours += calculateTotalHours(task.start_time, task.end_time);
        });
        return isNaN(totalHours) ? acc : acc + totalHours;
    }, 0);

    // Calculate total hours per project for the entire month
    const totalHoursPerProject = reports.reduce((acc, entry) => {
        entry.entries.forEach((task) => {
            const taskHours = calculateTotalHours(task.start_time, task.end_time);
            if (isNaN(taskHours)) return;

            const projectIndex = acc.findIndex(project => project.name === entry.project);
            if (projectIndex === -1) {
                acc.push({ name: entry.project, totalHours: taskHours });
            } else {
                acc[projectIndex].totalHours += taskHours;
            }
        });
        return acc;
    }, []);

    // Format total hours for display
    const formatTotal = (totalHours) => {
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);
        return `${hours} hours ${minutes} minutes`;
    };

    const sortedGroupedReports = Object.entries(groupedReports)
    .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Sort by date
    .map(([date, projects]) => ({
        date,
        totalHours: projects.reduce((total, project) => {
            return total + project.tasks.reduce((projectTotal, task) => projectTotal + task.totalHours, 0);
        }, 0),
        projects
    }));
    
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
                doc.save('monthly_user_report.pdf');
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
    
    

    return (
        <div className='container'>
            <h2>Monthly Time Tracking Reports</h2>
            <form onSubmit={handleFetchReports} className="row">
                <div className="col-md-3">
                    <label style={{ width: '100%' }}>
                        User:
                        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className='form-control'>
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="col-md-3">
                    <label>Project:
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="form-control"
                    >
                        <option value="">All Projects</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.name}>
                                {project.name} {/* Show project name */}
                            </option>
                        ))}
                    </select>
                    </label>
                </div>
                <div className="col-md-3">
                    <label style={{ width: '100%' }}>
                        Month:
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className='form-control'>
                            <option value="">Select Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="col-md-3">
                    <label style={{ width: '100%' }}>
                        Year:
                        <input
                            className='form-control'
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            min="2020"
                            max={new Date().getFullYear()}
                        />
                    </label>
                </div>
            </form>


            {selectedUser ? (
                sortedGroupedReports.length > 0 ? (
                    <>
                    <div id="reportContent">
                        <h3 style={{ textTransform: 'capitalize', margin: '20px 0px 0px' }}>
                            {users.length > 0 && selectedUser
                                ? users.find(user => user.id === parseInt(selectedUser, 10))?.name || 'User not found'
                                : 'Please select a user'}'s Report (Monthly)
                        </h3>
                        {!selectedProject?
                        <div style={{ textTransform: 'capitalize', margin: '20px 0px 0px', padding: 15, background: '#435ebe', color: '#ffffff', textAlign: 'center' }}>
                            <h4>Total Hours Worked in the Month: {formatTotal(totalHoursForMonth)}</h4>
                        </div>
                        :""}
                        {sortedGroupedReports.map((dateEntry, index) => (
                            <div key={index}>
                                <p style={{ textTransform: 'capitalize', margin: '30px 0px 15px' }}>
                                    <b>{dateEntry.date}</b> - Total: {formatTotal(dateEntry.totalHours)} {/* Display total for the day */}
                                </p>
                                <Table
                                    headers={['Project', 'Task', 'Start Time', 'End Time', 'Total Hours']} // Add Project in headers
                                    data={dateEntry.projects.flatMap((project) =>
                                        project.tasks.map((task) => ({
                                            project: project.name,
                                            taskName: task.task_name,
                                            startTime: task.start_time,
                                            endTime: task.end_time,
                                            totalHours: formatTotal(task.totalHours)
                                        }))
                                    )}
                                    renderRow={(task, rowIndex) => (
                                        <tr key={rowIndex} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '10px' }}>{task.project}</td>
                                            <td style={{ padding: '10px' }}>{task.taskName}</td>
                                            <td style={{ padding: '10px' }}>{task.startTime}</td>
                                            <td style={{ padding: '10px' }}>{task.endTime}</td>
                                            <td style={{ padding: '10px' }}>{task.totalHours}</td>
                                        </tr>
                                    )}
                                    columnWidths={['20%', '20%', '20%', '20%', '20%']} 
                                />
                            </div>
                        ))}

                        <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold', marginTop: 50 }}>
                            Total Hours per Project (Monthly)
                        </h4>
                        <div className="row">
                        {totalHoursPerProject
                            .filter((project) => {
                                // Show all projects if none is selected
                                if (!selectedProject) return true;
                                // Show only the selected project
                                return project.name === selectedProject;
                            })
                            .map((project, index) => (
                                <div
                                    key={index}
                                    className="col-md-4"
                                    style={{
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        className="card shadow-sm"
                                        style={{
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Inline shadow style
                                            background: 'rgb(247 247 247)', // Explicit background color for card
                                        }}
                                    >
                                        <div className="card-body" style={{ padding: '15px' }}>
                                            <h5
                                                className="card-title"
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    marginBottom: '10px',
                                                    color: '#333',
                                                }}
                                            >
                                                {project.name}
                                            </h5>
                                            <p
                                                className="card-text"
                                                style={{
                                                    fontSize: '16px',
                                                    color: '#555',
                                                }}
                                            >
                                                Total Hours: <span style={{ fontWeight: 'bold', color: '#435ebe' }}>
                                                    {formatTotal(project.totalHours)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                    
                    <button onClick={handleDownloadPDF} className="btn btn-primary my-4">
                        Download Report
                    </button>
                    </>
                    
                ) : (
                    <p>No reports available for the selected month and user.</p>
                )
            ) : (
                <p>Please select a user to generate the report.</p>
            )}
        </div>
    );
};

export default Reports;
