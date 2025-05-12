import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { resetPassword } from '../api/userService';

const Profile = () => {
  const { userId, isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      await resetPassword(userId, newPassword);
      setIsModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password reset successfully!');
    } catch (error) {
      setPasswordError('Failed to reset password. Try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
  }, [isAuthenticated, userId]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return (
    <div className="container">
      <div className="user-summary">
        <h2 style={{ textTransform: 'capitalize' }}>Your Profile</h2>
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={toggleModal}>Reset Password</button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={toggleModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reset Password</h2>
              <form onSubmit={handlePasswordReset}>
                <label>New Password:</label>
                <input
                  type="password"
                  className='form-control'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label>Confirm Password:</label>
                <input
                  type="password"
                  className='form-control'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
                <button type="submit" >Submit</button>
                <button type="button" onClick={toggleModal}>Cancel</button>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Profile;
