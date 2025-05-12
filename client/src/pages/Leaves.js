import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import CustomTable from '../components/Table'; // Import the CustomTable component

const Leaves = () => {
  const [leaveApplications, setLeaveApplications] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle any errors
  const { userId, isAuthenticated } = useAuth();

  // Fetch leave applications for the current user
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const response = await axios.get(`/api/leaves/${userId}`); // API endpoint to get leave applications
        
        // Check if leaveApplications exists in the response and set it
        if (response.data && Array.isArray(response.data.leaves)) {
          setLeaveApplications(response.data.leaves);
        } else {
          setLeaveApplications([]); // Default to empty array if no leave applications
        }
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        setError('Failed to fetch leave applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveApplications();
  }, [userId]);

  // Early return for redirecting if the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Function to handle deleting a leave application
  const handleDelete = async (leaveId) => {
    try {
      // Send DELETE request to API
      await axios.delete(`/api/leaves/${leaveId}`);
  
      // Update the state to remove the deleted leave
      setLeaveApplications(prevApplications =>
        prevApplications.filter(leave => leave.id !== leaveId)
      );
    } catch (error) {
      console.error('Error deleting leave application:', error);
      setError('Failed to delete leave application. Please try again later.');
    }
  };

  // Define the headers and renderRow function for CustomTable
  const headers = ['Leave Type', 'Leave Date', 'Comment', 'Status', 'Applied On', 'Action'];

  const renderRow = (leave, index) => (
    <tr key={index}>
      <td>{leave.leave_type}</td>
      <td>{new Date(leave.leave_date).toLocaleDateString()}</td>
      <td>{leave.comment || 'N/A'}</td>
      <td>{leave.status}</td>
      <td>{new Date(leave.created_at).toLocaleDateString()}</td>
      <td>
        <button onClick={() => handleDelete(leave.id)} className='btn btn-danger' disabled={leave.status !== 'pending'}>
          Delete
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container">
      <h2>Your Leave Applications</h2>
      {leaveApplications.length === 0 ? (
        <p>You have not applied for any leaves yet.</p>
      ) : (
        <CustomTable 
          headers={headers} 
          data={leaveApplications} 
          renderRow={renderRow}
          columnWidths={['20%', '20%', '30%', '15%', '15%', '10%']} // Adjust for new column
        />
      )}
    </div>
  );
};

export default Leaves;
