import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MeetingDetail = () => {
    const { meetingId } = useParams();
    const [users, setUsers] = useState([]);
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editedMeeting, setEditedMeeting] = useState(null);

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const response = await axios.get(`/api/meetings/${meetingId}`);
                setMeeting(response.data);
                setEditedMeeting(response.data);
            } catch (error) {
                console.error("Error fetching meeting:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://timetrackingapp.onrender.com/api/auth/users", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchMeeting();
        fetchUsers();
    }, [meetingId]);

    if (loading) return <div>Loading...</div>;
    if (!meeting) return <div>Meeting not found</div>;

    // Get user name by ID
    const getUserName = (userId) => {
        const user = users.find((u) => u.email === userId);
        return user ? user.name : `Unknown (ID: ${userId})`;
    };

    const handleInputChange = (e, field, minuteId = null) => {
        setEditedMeeting((prev) => {
            if (!prev) return prev;
    
            if (minuteId) {
                // Update the specific minute in the minutes array
                const updatedMinutes = prev.minutes.map((minute) =>
                    minute.id === minuteId ? { ...minute, [field]: e.target.value } : minute
                );
    
                return { ...prev, minutes: updatedMinutes };
            }
    
            // Otherwise, update the main meeting fields
            return { ...prev, [field]: e.target.value };
        });
    };
    
    const handleListChange = (e, field) => {
        const selectedOptions = e.target?.selectedOptions;
        if (!selectedOptions) return; // Prevents error if undefined
    
        const selectedValues = Array.from(selectedOptions, (option) => option.value);
        if (field === "meeting_guests") {
            const value = e.target.value;
            setEditedMeeting((prev) => ({
                ...prev,
                [field]: field === "meeting_guests" ? value.split(",").map((item) => item.trim()) : value, // Convert to array only for meeting_guests
            }));
        }else{
            setEditedMeeting((prev) => ({ ...prev, [field]: selectedValues }));
        }
    };
    

    const handleTaskChange = (e, minuteId, taskId, field) => {
        setEditedMeeting((prev) => {
            if (!prev) return prev;
    
            const updatedMinutes = prev.minutes.map((minute) => {
                if (minute.id === minuteId) {
                    return {
                        ...minute,
                        tasks: minute.tasks.map((task) =>
                            task.id === taskId ? { ...task, [field]: e.target.value } : task
                        ),
                    };
                }
                return minute;
            });
    
            return { ...prev, minutes: updatedMinutes };
        });
    };
    

    const toggleEdit = () => {
        setEditing(!editing);
    };

    const saveChanges = async () => {
        try {
            await axios.put(`/api/meetings/${meetingId}`, editedMeeting, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            setMeeting(editedMeeting);
            setEditing(false);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <div className="d-flex justify-content-between">
                    <h2>Meeting Details</h2>
                    <button className="btn btn-primary" onClick={toggleEdit} style={{ width: "40px" }}>
                        {editing ? <i className="fa fa-times"></i> : <i className="fa fa-pencil"></i>}
                    </button>
                </div>

                <div className="mt-3">
                    <label><strong>Topic:</strong></label>
                    {editing ? (
                        <input type="text" className="form-control" value={editedMeeting.meeting_topic} onChange={(e) => handleInputChange(e, "meeting_topic")} />
                    ) : (
                        <p>{meeting.meeting_topic}</p>
                    )}
                </div>
 
                <div>
                    <label><strong>Date:</strong></label>
                    {editing ? (
                        <input type="date" className="form-control" value={editedMeeting.meeting_date.split("T")[0]} onChange={(e) => handleInputChange(e, "meeting_date")} />
                    ) : (
                        <p>{new Intl.DateTimeFormat("en-GB").format(new Date(meeting.meeting_date))}</p>
                    )}
                </div>
              
                <div>
                    <label><strong>Attendees:</strong></label>
                    {editing ? (
                        <select multiple className="form-control" value={editedMeeting.meeting_attendees} onChange={(e) => handleListChange(e, "meeting_attendees")}> 
                            {users.map((user) => (
                                <option key={user.email} value={user.email}>{user.name}</option>
                            ))}
                        </select>
                    ) : (
                    <p>{meeting.meeting_attendees.map(getUserName).join(", ")}</p>
                    )}
                </div>
                {meeting.meeting_guests.length>0 ? (
                <div>
                    <label><strong>Guests:</strong></label>
                    {editing ? (
                        <input
                            type="text"
                            className="form-control"
                            value={editedMeeting.meeting_guests.join(", ")} // Convert array to string
                            onChange={(e) => handleListChange(e, "meeting_guests")} // Update correctly
                        />
                    ) : (
                        <p>{meeting.meeting_guests.join(", ")}</p>
                    )}

                </div>
                ) : null}
              
                <div>
                    <label><strong>Agenda:</strong></label>
                    {editing ? (
                        <textarea className="form-control" value={editedMeeting.meeting_agenda} onChange={(e) => handleInputChange(e, "meeting_agenda")} />
                    ) : (
                        <p>{meeting.meeting_agenda}</p>
                    )}
                </div>

                <h3 className="mt-4">Meeting Minutes & Tasks</h3>
                {meeting.minutes.map((minute) => (
                    <div key={minute.id} className="mt-3">
                        {editing ? (
                            <input
                                type="text"
                                className="form-control"
                                value={minute.topic}
                                onChange={(e) => handleInputChange(e, "topic", minute.id)}
                            />
                        ) : (
                            <h5>{minute.topic}</h5>
                        )}
                        
                        {editing ? (
                            <textarea
                                className="form-control"
                                value={minute.description}
                                onChange={(e) => handleInputChange(e, "description", minute.id)}
                            />
                        ) : (
                            <p>{minute.description}</p>
                        )}
                    

                    {minute.type !== "Information" ? (
                        <table className="table table-bordered mt-2">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Task</th>
                                    <th>Assignee</th>
                                    <th>Project/Task Title</th>
                                    <th>Priority</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minute.tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>
                                            {editing ? (
                                                <input type="text" className="form-control" value={task.task_description} onChange={(e) => handleTaskChange(e, minute.id, task.id, "task_description")} />
                                            ) : (
                                                task.task_description
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <select className="form-control" value={task.assignee} onChange={(e) => handleTaskChange(e, minute.id, task.id, "assignee")}>
                                                    {users.map((user) => (
                                                        <option key={user.id} value={user.id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                users.find((u) => u.id === task.assignee)?.name || "Unknown"
                                            )}
                                        </td><td>
                                            {editing ? (
                                                <input type="text" className="form-control" value={task.project_or_task} onChange={(e) => handleTaskChange(e, minute.id, task.id, "project_or_task")} />
                                            ) : (
                                                task.project_or_task
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <select className='form-control' value={task.prev} onChange={(e) => handleTaskChange(e, minute.id, task.id, "priority")} >
                                                     <option value="High">High</option>
                                                     <option value="Medium">Medium</option>
                                                     <option value="Low">Low</option>
                                                </select>
                                            ) : (
                                                task.priority
                                            )}
                                        </td><td>
                                            {editing ? (
                                                <input type="date" className="form-control" value={task.due_date.split("T")[0]} onChange={(e) => handleTaskChange(e, minute.id, task.id, "due_date")} />
                                            ) : (
                                                new Intl.DateTimeFormat("en-GB").format(new Date(task.due_date))
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <select className="form-control" value={task.status} onChange={(e) => handleTaskChange(e, minute.id, task.id, "status")}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            ) : (
                                                task.status
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <input type="text" className="form-control" value={task.comments} onChange={(e) => handleTaskChange(e, minute.id, task.id, "comments")} />
                                            ) : (
                                                task.comments
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ):''}
                    </div>
                ))}

                {editing && <button className="btn btn-success mt-3" onClick={saveChanges}>Save Changes</button>}
            </div>
        </div>
    );
};

export default MeetingDetail;
