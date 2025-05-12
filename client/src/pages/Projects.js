import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useAuth } from '../context/AuthContext'; 
import InputField from '../components/InputField';


const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [users_id, setSelectUsers] = useState([]);
    const [domain, setDomain] = useState('');
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [users, setUsers] = useState([]);

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch(`${serverUrl}/api/projects/${user.domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setProjects(data);
            setDomain(user.domain);
        };
        fetchProjects();
        const fetchUsers = async () => {
            const response = await fetch(`http://localhost:5000/api/auth/users/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const userData = await response.json();
            setUsers(userData);
        };
        fetchUsers();
    }, [serverUrl, user.domain]);
    
    const handleCreateProject = async (e) => {
        e.preventDefault();
        const response = await fetch(`${serverUrl}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({users_id, name, description, domain }),
        });
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Project creation failed');
        }
    };

    const handleDeleteProject = async (projectId) => {
        const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        if (response.ok) {
            // Immediately remove the deleted project from the state
            window.location.reload();
        } else {
            alert('Failed to delete project');
        }
    };

    const handleEditProject = (project) => {
        setEditingProjectId(project.id);
        setName(project.name);
        setDescription(project.description);
        setSelectUsers(project.userId);
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        const response = await fetch(`${serverUrl}/api/projects/${editingProjectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ users_id, name, description, domain }),
        });
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Failed to update project');
        }
    };
    const getUserNames = (projectUsersId) => {
        const userIds = Array.isArray(projectUsersId)
            ? projectUsersId
            : JSON.parse(projectUsersId); // Parse if it's a string
        
        return userIds
            .map((id) => {
                const user = users.find((u) => u.id === parseInt(id, 10)); // Convert `id` to number for comparison
                return user?.name || 'N/A';
            })
            .join(', ');
    };
    const headers = ['Name', 'Description', 'Assigness', 'Actions'];

    return (
        <div className='container'>
            <h2>Manage Projects</h2>
            <form onSubmit={editingProjectId ? handleUpdateProject : handleCreateProject} className='row' style={{marginBottom: '30px'}}>
                <div className="col-md-12">
                    <InputField 
                        label="Project Name" 
                        className='form-control'
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter project name" 
                    />
                </div>
                <div className='col-md-6'>
                    <div className="col-md-12">
                        <label>Assignees</label>
                        <select
                            name="userId"
                            className="form-control"
                            value={users_id} // Bind the array state here
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                                if (selectedOptions.includes("all")) {
                                    // "Select All" selected, include all user IDs
                                    setSelectUsers(users.map((user) => user.id.toString()));
                                } else {
                                    // Otherwise, update with selected options
                                    setSelectUsers(selectedOptions);
                                }
                            }}
                            multiple // Enable multiple selections
                            style={{ height: 130 }}
                            required
                        >
                            <option value="all" style={{ background: '#f1f1f1', padding: 5 }}>
                                Select All
                            </option>
                            {users.map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                    style={{ borderBottom: '1px solid rgb(219 219 219)', padding: 5 }}
                                >
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <label>Description</label>
                    <textarea 
                        rows={3} 
                        className='form-control'
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Enter project description" 
                        required
                        style={{height:130}}
                    />  
                </div>
                <div className="col-md-12" style={{marginTop: '20px'}}>
                    <button type="submit">{editingProjectId ? 'Update Project' : 'Create Project'}</button>
                {editingProjectId && (
                    <button type="button" onClick={() => {
                        setEditingProjectId(null);
                        setName('');
                        setDescription('');
                    }}>Cancel</button>
                )}
                </div>
            </form>
            {projects.length > 0 ? (
            <Table 
                headers={headers} 
                data={projects} 
                renderRow={(project) => (
                    <tr key={project.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px' }}>{project.name}</td>
                        <td style={{ padding: '10px' }}>{project.description}</td>
                        <td style={{ padding: '10px' }}>{getUserNames(project.users_id)}</td>
                        <td style={{ padding: '10px', width: '175px'}}>
                            <button onClick={() => handleEditProject(project)}  className='btn btn-primary'>Edit</button>
                            <button onClick={() => handleDeleteProject(project.id)} className='btn btn-danger'>Delete</button>
                        </td>
                    </tr>
                )}
            />) : (
                <p>No Projects Added.</p>
            )}
        </div>
    );
};


export default Projects;
