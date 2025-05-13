import React, { useEffect, useState } from 'react';
import CustomTable from '../components/Table';  // Import CustomTable

function Users() {
    const [users, setUsers] = useState([]); // Store list of users

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('https://timetrackingapp.onrender.com/api/auth/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
            });
            const data = await response.json();
            setUsers(data);
        };

        fetchUsers();
    }, []);

    // Function to handle accept or decline actions
    const handleStatusUpdate = async (userId, status) => {
        try {
            const response = await fetch(`https://timetrackingapp.onrender.com/api/auth/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, status } : user
                ));
            } else {
                alert('Failed to update user status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
    };
    const headers = ["Name", "Email", 'Role', "Signup Date", "Actions"];

    return (
        <div className='container'>
            <h2>All Users</h2>
            {users.length === 0 ? (
                <p>You have not applied for any leaves yet.</p>
            ) : (
            <CustomTable
                headers={headers}
                data={users}
                renderRow={(user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{formatDate(user.created)}</td>
                        <td>
                            <button onClick={() => handleStatusUpdate(user.id, 1)} className='btn btn-success' disabled={user.status === 1}>Accept</button>
                            <button onClick={() => handleStatusUpdate(user.id, 2)} className='btn btn-danger' disabled={user.status === 2}>Decline</button>
                        </td>
                    </tr>
                )}
            />
            )}
        </div>
    );
}

export default Users;
