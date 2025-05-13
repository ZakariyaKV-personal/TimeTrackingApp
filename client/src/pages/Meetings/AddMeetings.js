import React, { useState, useEffect } from 'react';
import { Link  } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomTable from '../../components/Table';
import axios from 'axios';

const MeetingForm = () => {
    const { user } = useAuth();
    const [meetingData, setMeetingData] = useState({
        meeting_date: '',
        meeting_topic: '',
        meeting_attendees: [],
        meeting_guests: [],
        meeting_agenda: '',
        minutes: { topic: '', description: '', type: 'Information', tasks: [] }
    });
    const [meetings, setMeetings] = useState([]); 
    const [newTask, setNewTask] = useState({ task_description: '', assignee: '', priority: '', project_or_task: '', due_date: '', status: '', comments: '' });
    const [users, setUsers] = useState([]);
    const [newGuestEmail, setNewGuestEmail] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [showGuests, setShowGuests] = useState(false);
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://timetrackingapp.onrender.com';
    
    useEffect(() => {
        const fetchUsersAndMeetings = async () => {
            try {
                const [usersRes, meetingsRes] = await Promise.all([
                    fetch(`${serverUrl}/api/auth/users/`, { 
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } 
                    }),
                    fetch(`${serverUrl}/api/meetings/getbyuser/${user.id}`, { 
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } 
                    })
                ]);
    
                const usersData = await usersRes.json();
                const meetingsData = await meetingsRes.json(); // Convert response to JSON
    
                setUsers(usersData);
                setMeetings(Array.isArray(meetingsData) ? meetingsData : [meetingsData]); // Ensure it's an array
    
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchUsersAndMeetings();
    }, [serverUrl, user.id]); // Ensure `user.id` is included as a dependency
    
    const validateForm = () => {
        const errors = {};
        if (!meetingData.meeting_date) errors.meeting_date = 'Meeting date is required.';
        if (!meetingData.meeting_topic) errors.meeting_topic = 'Meeting topic is required.';
        if (meetingData.meeting_attendees.length === 0 || meetingData.meeting_attendees[0] === '') errors.meeting_attendees = 'At least one attendee is required.';
        if (!meetingData.meeting_agenda) errors.meeting_agenda = 'Agenda is required.';
        if (!meetingData.minutes.topic) errors.minute_topic = 'Minute topic is required.';
        if (!meetingData.minutes.description) errors.minute_description = 'Minute description is required.';
        if (!meetingData.minutes.type) errors.minute_type = 'Minute type is required.';

        // Validate required fields for 'Action Item' type and if guests exist
        if (meetingData.minutes.type === 'Action Item' && meetingData.meeting_guests.length > 0) {

        }

        // // Validate task-related fields for 'Action Item'
        // meetingData.minutes.tasks.forEach((task, index) => {
        //     if (!task.task_description) errors[`task_description_${index}`] = 'Task description is required.';
        //     if (!task.assignee) errors[`task_assignee_${index}`] = 'Assignee is required.';
        //     if (!task.due_date) errors[`task_due_date_${index}`] = 'Due date is required.';
        // });

        return errors;
    };
    const handleInputChange = (e) => {
        const { name, value, options } = e.target;
    
        let selectedValues = value; // Default to value for text inputs
    
        if (options) {
            selectedValues = Array.from(options)
                .filter(opt => opt.selected && opt.value !== 'all')
                .map(opt => opt.value); // Collect selected emails
        }
    
        // If "all" is selected, find all user emails
        if (value === 'all') {
            selectedValues = users.map(user => user.email); // Store emails instead of IDs
        }
    
        setMeetingData(prevState => ({
            ...prevState,
            [name]: selectedValues,
            created_user_id: user?.id || null, // Ensure user exists
        }));
    };
    
    

    const handleMinuteChange = (e) => {
        setMeetingData(prevState => ({
            ...prevState,
            minutes: { ...prevState.minutes, [e.target.name]: e.target.value }
        }));
    };

    //const handleGuestEmailChange = (e) => setNewGuestEmail(e.target.value);
    const handleGuestEmailChange = (e) => {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for basic email validation
    
        setNewGuestEmail(email);
    
        if (email && !emailRegex.test(email)) {
            setFormErrors(prev => ({ ...prev, guestEmail: 'Invalid email address.' }));
        } else {
            setFormErrors(prev => {
                const { guestEmail, ...rest } = prev; // Remove the error if the email is valid
                return rest;
            });
        }
    };

    //const toggleGuestsDisplay = () => setShowGuests(prev => !prev);
    const toggleGuestsDisplay = () => {
        if (newGuestEmail && !meetingData.meeting_guests.includes(newGuestEmail)) {
            setShowGuests(prev => !prev);
            setNewGuestEmail(''); // Clear the email input field
        } else if (meetingData.meeting_guests.length > 0) {
            // Add an error for guests if there are already added ones
            setFormErrors(prevErrors => ({
                ...prevErrors,
                guestError: 'Please delete the already added guest(s) before toggling.',
            }));
        } else {
            // Clear the guest error if no issue exists
            setFormErrors(prevErrors => {
                const { guestError, ...rest } = prevErrors;
                return rest; // Remove guestError from the errors object
            });
            setShowGuests(prev => !prev);
        }
    };
    const handleAddGuestEmail = () => {
        if (newGuestEmail && !meetingData.meeting_guests.includes(newGuestEmail)) {
            setMeetingData(prevState => ({
                ...prevState,
                meeting_guests: [...prevState.meeting_guests, newGuestEmail]
            }));
            setNewGuestEmail('');
        }
    };

    const handleDeleteGuestEmail = (email) => {
        setMeetingData(prevState => ({
            ...prevState,
            meeting_guests: prevState.meeting_guests.filter(guest => guest !== email)
        }));
    };

    const handleAddTask = () => {
        setMeetingData(prevState => ({
            ...prevState,
            minutes: { ...prevState.minutes, tasks: [...prevState.minutes.tasks, { ...newTask }] }
        }));
        setNewTask({ task_description: '', assignee: '', priority: 'Medium', project_or_task: '', due_date: '', status: 'Pending', comments: '' });
    };

    const handleDeleteTask = (taskIndex) => {
        setMeetingData(prevState => ({
            ...prevState,
            minutes: { ...prevState.minutes, tasks: prevState.minutes.tasks.filter((_, index) => index !== taskIndex) }
        }));
    };

    const handleSaveMeeting = async () => {
        const errors = validateForm();
        setFormErrors(errors); // Update the error state
        if (Object.keys(errors).length === 0) {
            try {
                // No need to store the response if you're not using it
                if (meetingData.id) {
                    await axios.put(`/api/meetings/${meetingData.id}`, meetingData);
                } else {
                    await axios.post('/api/meetings', meetingData);
                }
                alert('Meeting saved/updated successfully');
                setMeetingData({ meeting_date: '', meeting_topic: '', meeting_attendees: [], meeting_guests: [], meeting_agenda: '', minutes: { topic: '', description: '', type: 'Information', tasks: [] } });
            } catch (error) {
                console.error('Error saving the meeting:', error);
            }
        }
    };
    

    const handleDeleteMeeting = async (id) => {
        try {
            await axios.delete(`/api/meetings/${id}`);
            setMeetings(meetings.filter(meeting => meeting.id !== id));
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);  // Add one day to the date
    return date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
};
  const renderRow = (meeting) => (
    <tr key={meeting.id}>
      <td>{formatDate(meeting.meeting_date)}</td>
      <td>{meeting.meeting_topic}</td>
      <td>{meeting.meeting_agenda}</td>
      <td>
        <Link to={`/viewmeeting/${meeting.id}`} className='btn btn-primary'><i className="fa fa-eye"></i></Link>
        <button onClick={() => handleDeleteMeeting(meeting.id)} className='btn btn-danger' style={{margin:0,marginLeft:'10px'}}><i className="fa fa-trash"></i></button>
      </td>
    </tr>
  );

  const columnWidths = ['15%', '20%', '45%', '20%'];
  
    return (
        <div className="container">
            <div className="row meeting-form-container">
                <h2>{meetingData.id ? 'Edit Meeting' : 'Create Meeting'}</h2>

                <div className="col-md-6 form-group">
                    <input type="date" name="meeting_date"  className='form-control' value={meetingData.meeting_date} onChange={handleInputChange} />
                    {formErrors.meeting_date && <p className="error-text">{formErrors.meeting_date}</p>}
                </div>
                <div className="col-md-6 form-group">
                    <input type="text" name="meeting_topic"  className='form-control' value={meetingData.meeting_topic} onChange={handleInputChange} placeholder="Meeting Topic" />
                    {formErrors.meeting_topic && <p className="error-text">{formErrors.meeting_topic}</p>}
                </div>
                <div className="col-md-6 form-group">
                    <select name="meeting_attendees"  className='form-control'value={meetingData.meeting_attendees} onChange={handleInputChange} multiple style={{ height: 130 }} required>
                        <option value="">Select Attendees</option>
                        <option value="all">Select All</option>
                        {users.map(user => (
                            <option key={user.id} value={user.email}>{user.name}</option>
                        ))}
                    </select>
                    {formErrors.meeting_attendees && <p className="error-text">{formErrors.meeting_attendees}</p>}
                </div>

                <div className="col-md-6 form-group">
                    <textarea name="meeting_agenda"  className='form-control' value={meetingData.meeting_agenda} onChange={handleInputChange} style={{ height: 130 }} placeholder="Meeting Agenda" />
                    {formErrors.meeting_agenda && <p className="error-text">{formErrors.meeting_agenda}</p>}
                </div>
                <div className='row' style={{padding:0, margin:0}}>
                    <div className="col-md-6 form-group">
                        <h4>Add Guests</h4>
                        <p>If add any guest please click add guest</p>
                    </div>
                    <div className="col-md-6 form-group" style={{display:'flex', justifyContent:'end'}}>
                    <button style={{width:150, margin:'auto 0px auto'}} type="button" onClick={toggleGuestsDisplay}>
                        {showGuests ? 'Delete Guests' : 'Add Guests'}
                    </button>
                    
                    </div>
                    {formErrors.guestError  && <p className="error-text">{formErrors.guestError }</p>}
                    {showGuests && (
                        <>
                            <div className="row guest-input-container">
                                <div className='col-md-10'>
                                    <input
                                        type="email"
                                        value={newGuestEmail}
                                        className="form-control"
                                        onChange={handleGuestEmailChange}
                                        placeholder="Add Guest Email"
                                    />
                                    {formErrors.guestEmail && <small className="error-text">{formErrors.guestEmail}</small>}
                                </div>
                                <div className='col-md-2'>
                                <button
                                    type="button"
                                    onClick={handleAddGuestEmail}
                                    className="btn-add-guest"
                                    disabled={formErrors.guestEmail ? true : false}
                                >
                                   <i className="fa fa-plus"></i>
                                </button>
                                </div>
                            </div>

                            <div className="guests-grid">
                                {meetingData.meeting_guests.map((guest, index) => (
                                    <div key={index} className="guest-item">
                                        <span className="guest-email">{guest}</span>
                                        <button
                                            className="delete-icon"
                                            onClick={() => handleDeleteGuestEmail(guest)}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>


                <h3>Meeting Minute</h3>
                <div className="col-md-6 form-group">
                    <input type="text" name="topic"  className='form-control' value={meetingData.minutes.topic} onChange={handleMinuteChange} placeholder="Minute Topic" />
                    {formErrors.minute_topic && <p className="error-text">{formErrors.minute_topic}</p>}
                </div>
                <div className="col-md-6 form-group">
                    <select name="type" className='form-control' value={meetingData.minutes.type} onChange={handleMinuteChange}>
                    <option value="">Select type</option>
                    <option value="Information">Information</option>
                        <option value="Action Item">Action Item</option>
                    </select>
                    {formErrors.minute_type && <p className="error-text">{formErrors.minute_type}</p>}
                </div>
                <div className="col-md-12 form-group">
                    <textarea name="description"  className='form-control' value={meetingData.minutes.description} onChange={handleMinuteChange} placeholder="Description" />
                    {formErrors.minute_description && <p className="error-text">{formErrors.minute_description}</p>}
                </div>

                {meetingData.minutes.type === 'Action Item' && (
                    <div className='col-md-12 '>
                        <div className="task-section">
                            <h4>Tasks</h4>
                            {meetingData.minutes.tasks.map((task, index) => (
                                <div key={index} className="task">
                                    <div>Task Description: {task.task_description}</div>
                                    <div>Assignee: {task.assignee}</div>
                                    <div>Priority: {task.priority}</div>
                                    <div>Project/Task: {task.project_or_task}</div>
                                    <div>Due Date: {task.due_date}</div>
                                    <div>Status: {task.status}</div>
                                    <div>Comments: {task.comments}</div>
                                    
                                    <button
                                        className="delete-icon"
                                        onClick={() => handleDeleteTask(index)}
                                    >
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                            <div class="row">
                                <div class="col-md-6">
                                <label>Task Description</label>
                                <input
                                    type="text" className='form-control'
                                    name="task_description"
                                    value={newTask.task_description}
                                    onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                                    placeholder="Task Description"
                                />
                                </div>
                                <div class="col-md-6">
                                <label>Select Assignee</label>
                                <select name="meeting_attendees"  className='form-control'value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} required>
                                    <option value="">Select Assignee</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                                </div>
                                <div class="col-md-6">
                                <label>Enter Project/Task Title</label>
                                <input
                                    type="text" className='form-control'
                                    name="project_or_task"
                                    value={newTask.project_or_task}
                                    onChange={(e) => setNewTask({ ...newTask, project_or_task: e.target.value })}
                                    placeholder="Project/Task"
                                />
                                </div>
                                <div class="col-md-6">
                                <label>Select Due Date</label>
                                <input
                                    type="date" className='form-control'
                                    name="due_date"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                />
                                </div>
                                <div class="col-md-6">
                                <label>Select Priority</label>
                                <select
                                    name="priority" className='form-control'
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="">Select Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                </div>
                                <div class="col-md-6">
                                <label>Select Status</label>
                                <select
                                    name="status" className='form-control'
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                </div>
                                <div class="col-md-12">
                                <label>Entent Comments</label>
                                <textarea
                                    name="comments" className='form-control'
                                    value={newTask.comments}
                                    onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
                                    placeholder="Comments"
                                />
                                </div>
                                <div class="col-md-12 mt-2">
                                <button onClick={handleAddTask}>Add Task</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                <div className="col-md-12 form-group">
                    <button onClick={handleSaveMeeting}>{meetingData.id ? 'Update Meeting' : 'Save Meeting'}</button>
                </div>
                <h2 style={{marginTop:'30px', marginBottom:'20px'}}>All Meetings</h2>
                <div className="col-md-12 form-group">
                {meetings[0]?.message === "Meeting not found" ? (
                    <p>No Meetings available.</p>
                ) : (
                <CustomTable
                    headers={['Date', 'Topic', 'Agenda', 'Actions']}
                    data={meetings}
                    renderRow={renderRow}
                    columnWidths={columnWidths}
                />
                )}
                
                </div>
            </div>
        </div>
    );
};

export default MeetingForm;
