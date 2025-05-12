import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import CustomTable from '../components/Table'; // Import the CustomTable component

const AdminAppliedLeaves = () => {
  const [leaveApplications, setLeaveApplications] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To handle any errors
  const { isAuthenticated, user } = useAuth(); // Assuming `user.email` is available

  // Fetch leave applications for users with the same email domain
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const response = await axios.get(`/api/leaves/all/${user.email}`); // Pass user email to filter by domain
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
  }, [user.email]); // Depend on user.email to trigger refetch

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

  // Function to handle status change
  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      // Send PUT request to update the status
      await axios.put(`/api/leaves/leave-status/${leaveId}`, { status: newStatus });

      // Update the state to reflect the status change and disable the dropdown
      window.location.reload(); // Refresh the page to reflect the status change
      setLeaveApplications(prevApplications =>
        prevApplications.map(leave =>
          leave.id === leaveId ? { ...leave, status: newStatus, disabled: true } : leave
        )
      );
    } catch (error) {
      console.error('Error updating leave status:', error);
      setError('Failed to update leave status. Please try again later.');
    }
  };

  // Define the headers and renderRow function for CustomTable
  const headers = ['Name', 'Leave Type', 'Leave Date', 'Comment', 'Status', 'Applied On'];

  const renderRow = (leave, index) => (
    <tr key={index}>
      <td>{leave.user_name}</td>
      <td>{leave.leave_type}</td>
      <td>{new Date(leave.leave_date).toLocaleDateString()}</td>
      <td>{leave.comment || 'N/A'}</td>
      <td>
        {leave.status === 'pending'? (
        <select
          value={leave.status}
          onChange={(e) => handleStatusChange(leave.id, e.target.value)}
          disabled={leave.disabled} // Disable dropdown if status has been changed
        >
        <option value="">Select Status</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
        ) : leave.status}
      </td>
      <td>{new Date(leave.created_at).toLocaleDateString()}</td>
    </tr>
  );

  return (
    <div className="container">
      <h2>Leave Applications for Your Employess</h2>
      {leaveApplications.length === 0 ? (
        <p>No leave applications found for this domain.</p>
      ) : (
        <CustomTable
          headers={headers}
          data={leaveApplications}
          renderRow={renderRow}
          columnWidths={['20%','13%', '13%', '30%', '10%', '14%']} // Adjust for new column
        />
      )}
    </div>
  );
};

export default AdminAppliedLeaves;
