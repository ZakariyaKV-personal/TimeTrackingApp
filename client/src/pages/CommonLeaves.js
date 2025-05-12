import React, { useCallback, useState, useEffect } from 'react';
import commonleaveService from '../api/commonleaveService';
import CustomTable from '../components/Table';
import { useAuth } from '../context/AuthContext';

const CommonLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const {user } = useAuth();
  const [leaveData, setLeaveData] = useState({
    leave_name: '',
    leave_date: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all common leaves from the service
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const leavesData = await commonleaveService.getAllLeaves(user.domain);
      const leaves = leavesData.map(leave => ({
        ...leave,
        leave_date: new Date(leave.leave_date).toISOString().split('T')[0]
      }));
      setLeaves(leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  }, [user.domain]); // domain is now a dependency

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prev) => ({
       ...prev, [name]: value,
      domain: user ? user.domain : '' 
     }));
  };

  // Create a new leave
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {      
      await commonleaveService.createLeave(leaveData);
      fetchLeaves(); // Refresh leaves list
      setLeaveData({ leave_name: '', leave_date: '' });
    } catch (error) {
      console.error('Error creating leave:', error);
      alert('Error creating leave');
    }
    setLoading(false);
  };

  // Edit an existing leave
  const handleEdit = (id) => {
    setEditMode(true);
    setEditingId(id);
    const leave = leaves.find((l) => l.id === id);
    setLeaveData({ leave_name: leave.leave_name, leave_date: leave.leave_date, domain: user.domain });
  };

  // Update a leave
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await commonleaveService.updateLeave(editingId, leaveData);
      fetchLeaves(); // Refresh leaves list
      setLeaveData({ leave_name: '', leave_date: '' });
      setEditMode(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating leave:', error);
      alert('Error updating leave');
    }
    setLoading(false);
  };

  // Delete a leave
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await commonleaveService.deleteLeave(id);
      fetchLeaves(); // Refresh leaves list
    } catch (error) {
      console.error('Error deleting leave:', error);
      alert('Error deleting leave');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);  // Add one day to the date
    return date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
};

  // Render row function for actions
  const renderRow = (leave) => (
    <tr key={leave.id}>
      <td>{leave.leave_name}</td>
      <td>{formatDate(leave.leave_date)}</td>
      <td>
        <button onClick={() => handleEdit(leave.id)} className='btn btn-primary'>Edit</button>
        <button onClick={() => handleDelete(leave.id)} className='btn btn-danger'>Delete</button>
      </td>
    </tr>
  );

  const columnWidths = ['40%', '40%', '20%'];

  return (
    <div className='container'>
      <h2>Add Leaves</h2>

      <form onSubmit={editMode ? handleUpdate : handleCreate} className='row'>
        <div className='col-md-6'>
          <input
            type="text"
            name="leave_name"
            className='form-control'
            value={leaveData.leave_name}
            onChange={handleChange}
            placeholder="Leave Name"
            required
          />
        </div>
        <div className='col-md-6'>
          <input
            type="date"
            name="leave_date"
            className='form-control'
            value={leaveData.leave_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className='col-md-12' style={{ margin: '10px 0px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : editMode ? 'Update Leave' : 'Create Leave'}
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2 style={{ margin: '20px 0px 10px' }}>Common Leaves</h2>
          {leaves.length === 0? (
            <p>No common leaves available.</p>
          ) : (
          <CustomTable
            headers={['Leave Name', 'Date', 'Actions']}
            data={leaves}
            renderRow={renderRow}
            columnWidths={columnWidths}
          />
          )}
        </>
      )}
    </div>
  );
};

export default CommonLeaves;
