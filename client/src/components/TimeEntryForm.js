import React, { useState, useEffect } from 'react';
import { getProjects, getTasks } from '../api/timeEntryService';
import { useAuth } from '../context/AuthContext';

const TimeEntryForm = ({ onSubmit, timeEntryToEdit }) => {
    const [startTime, setStartTime] = useState('');
    const {user } = useAuth();
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState('');
    const [projectId, setProjectId] = useState('');
    const [taskId, setTaskId] = useState('');
    const [status, setStatus] = useState('');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [taskName, setTaskName] = useState('');
    const [title, setTitle] = useState('');

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    useEffect(() => {
        const fetchProjects = async () => {
            const fetchedProjects = await getProjects(user.id);
            setProjects(fetchedProjects);
        };
        fetchProjects();
    }, [user.id]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (projectId) {
                const fetchedProjectTasks = await getTasks(projectId);
                setTasks(fetchedProjectTasks);
            } else {
                setTasks([]);
            }
        };
        fetchTasks();

        const selectedProject = projects.find(project => project.id === parseInt(projectId));
        setProjectName(selectedProject ? selectedProject.name : '');

        setTaskId('');
        setTaskName('');
    }, [projectId, projects]);

    useEffect(() => {
        const selectedTask = tasks.find(task => task.id === parseInt(taskId));
        setTaskName(selectedTask ? selectedTask.name : '');
    }, [taskId, tasks]);

    useEffect(() => {
        if (timeEntryToEdit) {
            setStartTime(timeEntryToEdit.start_time);
            setEndTime(timeEntryToEdit.end_time);
            setDate(timeEntryToEdit.date);
            setTitle(timeEntryToEdit.title);
            setProjectId(timeEntryToEdit.project_id);
            setTaskId(timeEntryToEdit.task_id);
            setStatus(timeEntryToEdit.status);
            setProjectName(timeEntryToEdit.project_name);
            setTaskName(timeEntryToEdit.task_name);
        }
    }, [timeEntryToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const entryData = { startTime, endTime, date, projectId, taskId, status, projectName, taskName, title };
        entryData.taskId = parseInt(taskId, 10);
        
        if (timeEntryToEdit) {
            onSubmit(entryData, timeEntryToEdit.id);
        } else {
            onSubmit(entryData);
        }

        setStartTime('');
        setEndTime('');
        setDate('');
        setTitle('');
        setProjectId('');
        setTaskId('');
        setStatus('');
    };

    return (
        <form onSubmit={handleSubmit} className='row' style={{ marginBottom: 30 }}>
        <div className='col-md-4'>
            <label htmlFor='date'>Date</label>
            <input type="date" className='form-control' value={date} onChange={(e) => setDate(e.target.value)} max={todayString} required />
        </div>
        <div className='col-md-4'>
            <label htmlFor='startTime'>Start Time</label>
            <input type="time" className='form-control' value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className='col-md-4'>
            <label htmlFor='endTime'>End Time</label>
            <input type="time" className='form-control' value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div className='col-md-4'>
            <label htmlFor='projectId'>Projects</label>
            <select
                className='form-control'
                value={projectId}
                onChange={(e) => {
                    const selectedProjectId = e.target.value;
                    setProjectId(selectedProjectId);
                    const selectedProject = projects.find(project => project.id === parseInt(selectedProjectId)); // Ensure IDs match as numbers
                    setProjectName(selectedProject ? selectedProject.name : '');
                }}
                required
            >
                <option value="">Select Project</option>
                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.name}
                    </option>
                ))}
            </select>
        </div>
        <div className='col-md-4'>
            <label htmlFor='taskId'>Pick Your Task</label>
            <select
                className='form-control'
                value={taskId}
                onChange={(e) => {
                    const selectedTaskId = e.target.value;
                    setTaskId(selectedTaskId);
                    const selectedTask = tasks.find(task => task.id === parseInt(selectedTaskId)); // Ensure IDs match as numbers
                    setTaskName(selectedTask ? selectedTask.name : '');
                }}
                required
            >
                <option value="">Select Task</option>
                {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                        {task.name}
                    </option>
                ))}
            </select>
        </div>
        <div className='col-md-4'>
            <label htmlFor='status'>Status</label>
            <select className='form-control' value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="">Select Status</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="onHold">On Hold</option>
            </select>
        </div>
        <div className='col-md-12'>
        <label htmlFor='status'>Work Description</label>
            <textarea className='form-control' value={title} placeholder='Describe Your Today Works' rows={6} onChange={(e) => setTitle(e.target.value)} required ></textarea>
        </div>
        
        <div className='col-md-10'></div>
        <div className='col-md-2'>
            {/* <label htmlFor='submit' style={{ opacity: 0, width: '100%' }}>Button</label> */}
            <button type='submit' style={{marginTop:15}}>Submit</button>
        </div>

        {/* Hidden fields for projectName and taskName */}
        <input type="hidden" name="projectName" value={projectName} />
        <input type="hidden" name="taskName" value={taskName} />
    </form>
    );
};

export default TimeEntryForm;
