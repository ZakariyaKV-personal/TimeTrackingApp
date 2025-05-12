const db = require('../config/db');

// Model for Meeting
const Meeting = {
    create: (created_user_id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, callback) => {
        const attendeesString = JSON.stringify(meeting_attendees);
        const guestsString = JSON.stringify(meeting_guests);
        db.query('INSERT INTO meetings (created_user_id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda) VALUES (?, ?, ?, ?, ?, ?)', 
                 [created_user_id, meeting_date, meeting_topic, attendeesString, guestsString, meeting_agenda], callback);
    },
    // Get all meetings with associated minutes and tasks
    findAll: (callback) => {
        const query = `
            SELECT m.*, mm.id AS minute_id, mm.topic AS minute_topic, mm.description AS minute_description, mm.type AS minute_type,
                   t.id AS task_id, t.task_description, t.assignee, t.priority, t.project_or_task, t.due_date, t.status, t.comments
            FROM meetings m
            LEFT JOIN meeting_minutes mm ON m.id = mm.meeting_id
            LEFT JOIN meetingtasks t ON mm.id = t.minute_id
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err, null);

            const meetings = [];
    
            const minuteMap = new Map(); // Store minutes by their ID to prevent duplication
    
            results.forEach(row => {
                if (row.minute_id) {
                    if (!minuteMap.has(row.minute_id)) {
                        // If minute is not already added, create a new one
                        minuteMap.set(row.minute_id, {
                            id: row.minute_id,
                            topic: row.minute_topic,
                            description: row.minute_description,
                            type: row.minute_type,
                            tasks: []
                        });
                    }
    
                    if (row.task_id) {
                        // Add task to the corresponding minute
                        minuteMap.get(row.minute_id).tasks.push({
                            id: row.task_id,
                            task_description: row.task_description,
                            assignee: row.assignee,
                            priority: row.priority,
                            project_or_task: row.project_or_task,
                            due_date: row.due_date,
                            status: row.status,
                            comments: row.comments
                        });
                    }
                }
            });
    
            // Convert Map values to an array and assign it to `meeting.minutes`
            meeting.minutes = Array.from(minuteMap.values());
            callback(null, meetings);
        });
    },

    // Get meeting by ID with associated minutes and tasks
    findById: (id, callback) => {
        const query = `
            SELECT 
                m.*, 
                mm.id AS minute_id, mm.topic AS minute_topic, mm.description AS minute_description, mm.type AS minute_type,
                t.id AS task_id, t.task_description, t.assignee, t.priority, t.project_or_task, t.due_date, t.status, t.comments
            FROM meetings m
            LEFT JOIN meeting_minutes mm ON m.id = mm.meeting_id
            LEFT JOIN meetingtasks t ON mm.id = t.minute_id
            WHERE m.id = ?
        `;
    
        db.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null);
    
            const meeting = {
                id: results[0].id,
                meeting_date: results[0].meeting_date,
                meeting_topic: results[0].meeting_topic,
                meeting_attendees: JSON.parse(results[0].meeting_attendees),
                meeting_guests: JSON.parse(results[0].meeting_guests),
                meeting_agenda: results[0].meeting_agenda,
                minutes: []
            };
    
            const minuteMap = new Map(); // Store minutes by their ID to prevent duplication
    
            results.forEach(row => {
                if (row.minute_id) {
                    if (!minuteMap.has(row.minute_id)) {
                        // If minute is not already added, create a new one
                        minuteMap.set(row.minute_id, {
                            id: row.minute_id,
                            topic: row.minute_topic,
                            description: row.minute_description,
                            type: row.minute_type,
                            tasks: []
                        });
                    }
    
                    if (row.task_id) {
                        // Add task to the corresponding minute
                        minuteMap.get(row.minute_id).tasks.push({
                            id: row.task_id,
                            task_description: row.task_description,
                            assignee: row.assignee,
                            priority: row.priority,
                            project_or_task: row.project_or_task,
                            due_date: row.due_date,
                            status: row.status,
                            comments: row.comments
                        });
                    }
                }
            });
    
            // Convert Map values to an array and assign it to `meeting.minutes`
            meeting.minutes = Array.from(minuteMap.values());
    
            callback(null, meeting);
        });
    },
    

    findByUserId: (id, callback) => {
        const query = `
            SELECT m.*, mm.id AS minute_id, mm.topic AS minute_topic, mm.description AS minute_description, mm.type AS minute_type,
                   t.id AS task_id, t.task_description, t.assignee, t.priority, t.project_or_task, t.due_date, t.status, t.comments
            FROM meetings m
            LEFT JOIN meeting_minutes mm ON m.id = mm.meeting_id
            LEFT JOIN meetingtasks t ON mm.id = t.minute_id
            WHERE m.created_user_id = ?
        `;
    
        db.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, []);
    
            const meetingsMap = new Map(); // Store meetings by their ID to avoid duplication
    
            results.forEach(row => {
                if (!meetingsMap.has(row.id)) {
                    // Create a new meeting entry if it doesn't exist
                    meetingsMap.set(row.id, {
                        id: row.id,
                        meeting_date: row.meeting_date,
                        meeting_topic: row.meeting_topic,
                        meeting_attendees: JSON.parse(row.meeting_attendees || "[]"),
                        meeting_guests: JSON.parse(row.meeting_guests || "[]"),
                        meeting_agenda: row.meeting_agenda,
                        minutes: new Map() // Use a Map to avoid duplicate minutes
                    });
                }
    
                const meeting = meetingsMap.get(row.id);
    
                if (row.minute_id) {
                    if (!meeting.minutes.has(row.minute_id)) {
                        // If minute is not already added, create a new one
                        meeting.minutes.set(row.minute_id, {
                            id: row.minute_id,
                            topic: row.minute_topic,
                            description: row.minute_description,
                            type: row.minute_type,
                            tasks: []
                        });
                    }
    
                    if (row.task_id) {
                        // Add task to the corresponding minute
                        meeting.minutes.get(row.minute_id).tasks.push({
                            id: row.task_id,
                            task_description: row.task_description,
                            assignee: row.assignee,
                            priority: row.priority,
                            project_or_task: row.project_or_task,
                            due_date: row.due_date,
                            status: row.status,
                            comments: row.comments
                        });
                    }
                }
            });
    
            // Convert Map to an array and ensure each meeting has minutes as an array
            const meetings = Array.from(meetingsMap.values()).map(meeting => ({
                ...meeting,
                minutes: Array.from(meeting.minutes.values()) // Convert minutes map to array
            }));
    
            callback(null, meetings);
        });
    },
    
    update: (id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, callback) => {
        const attendeesString = JSON.stringify(meeting_attendees);
        const guestsString = JSON.stringify(meeting_guests);
        db.query('UPDATE meetings SET meeting_date = ?, meeting_topic = ?, meeting_attendees = ?, meeting_guests = ?, meeting_agenda = ? WHERE id = ?', 
                 [meeting_date, meeting_topic, attendeesString, guestsString, meeting_agenda, id], callback);
    }
};

// Model for Meeting Minutes
const MeetingMinute = {
    create: (meeting_id, topic, description, type, callback) => {
        db.query('INSERT INTO meeting_minutes (meeting_id, topic, description, type) VALUES (?, ?, ?, ?)', 
                 [meeting_id, topic, description, type], callback);
    },

    update: (id, topic, description, type, callback) => {
        db.query('UPDATE meeting_minutes SET topic = ?, description = ?, type = ? WHERE id = ?', 
                 [topic, description, type, id], callback);
    }
};

// Model for Tasks related to Action Items
const Task = {
    create: (meeting_id, minute_id, task_description, assignee, priority, project_or_task, due_date, status, comments, callback) => {
        db.query('INSERT INTO meetingtasks (meeting_id, minute_id, task_description, assignee, priority, project_or_task, due_date, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                 [meeting_id, minute_id, task_description, assignee, priority, project_or_task, due_date, status, comments], callback);
    },

    update: (id, task_description, assignee, priority, project_or_task, due_date, status, comments, callback) => {
        db.query('UPDATE meetingtasks SET task_description = ?, assignee = ?, priority = ?, project_or_task = ?, due_date = ?, status = ?, comments = ? WHERE id = ?', 
                 [task_description, assignee, priority, project_or_task, due_date, status, comments, id], callback);
    }
};

// Controller for meeting, minutes, and task creation, update, and deletion

exports.createMeeting = (req, res) => {
    const { created_user_id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, minutes } = req.body;

    const minutesArray = Array.isArray(minutes) ? minutes : [minutes]; // Ensure it's an array

    // Step 1: Create the meeting
    Meeting.create(created_user_id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, (err, meetingResult) => {
        if (err) return res.status(500).json({ message: 'Database error when creating meeting' });

        const meetingId = meetingResult.insertId;

        // Step 2: Create meeting minutes and associated tasks
        minutesArray.forEach(minute => {
            MeetingMinute.create(meetingId, minute.topic, minute.description, minute.type, (err, minuteResult) => {
                if (minute.type === 'Action Item' && Array.isArray(minute.tasks)) {
                    // Create tasks if the minute is an Action Item
                    minute.tasks.forEach(task => {
                        Task.create(meetingId, minuteResult.insertId, task.task_description, task.assignee, task.priority, task.project_or_task, task.due_date, task.status, task.comments, (err, taskResult) => {
                            if (err) console.log('Error creating task:', err);
                        });
                    });
                }
            });
        });

        res.status(201).json({ message: 'Meeting, minutes, and tasks created successfully' });
    });
};


// Update meeting, minutes, and tasks in one go
exports.updateMeeting = (req, res) => {
    const { id } = req.params;
    const { meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, minutes } = req.body;

    Meeting.update(id, meeting_date, meeting_topic, meeting_attendees, meeting_guests, meeting_agenda, (err) => {
        if (err) return res.status(500).json({ message: 'Error updating meeting' });

        minutes.forEach(minute => {
            if (minute.id) {
                MeetingMinute.update(minute.id, minute.topic, minute.description, minute.type, (err) => {
                    if (err) console.log('Error updating minute:', err);
                });

                if (minute.type === 'Action Item') {
                    minute.tasks.forEach(task => {
                        if (task.id) {
                            Task.update(task.id, task.task_description, task.assignee, task.priority, task.project_or_task, task.due_date, task.status, task.comments, (err) => {
                                if (err) console.log('Error updating task:', err);
                            });
                        } else {
                            Task.create(minute.id, task.task_description, task.assignee, task.priority, task.project_or_task, task.due_date, task.status, task.comments, (err) => {
                                if (err) console.log('Error creating task:', err);
                            });
                        }
                    });
                }
            } else {
                MeetingMinute.create(id, minute.topic, minute.description, minute.type, (err, result) => {
                    if (err) console.log('Error creating minute:', err);
                    
                    if (minute.type === 'Action Item') {
                        minute.tasks.forEach(task => {
                            Task.create(result.insertId, task.task_description, task.assignee, task.priority, task.project_or_task, task.due_date, task.status, task.comments, (err) => {
                                if (err) console.log('Error creating task:', err);
                            });
                        });
                    }
                });
            }
        });

        res.status(200).json({ message: 'Meeting, minutes, and tasks updated successfully' });
    });
};


// Delete meeting, minutes, and tasks in one go
exports.deleteMeeting = (req, res) => {
    const { id } = req.params;

    // Step 1: Delete all meeting tasks where meeting_id = id
    db.query('DELETE FROM meetingtasks WHERE meeting_id = ?', [id], (err) => {
        if (err) {
            console.error("Error deleting tasks:", err);
            return res.status(500).json({ message: 'Error deleting tasks' });
        }

        // Step 2: Delete all meeting minutes where meeting_id = id
        db.query('DELETE FROM meeting_minutes WHERE meeting_id = ?', [id], (err) => {
            if (err) {
                console.error("Error deleting meeting minutes:", err);
                return res.status(500).json({ message: 'Error deleting meeting minutes' });
            }

            // Step 3: Delete the meeting itself
            db.query('DELETE FROM meetings WHERE id = ?', [id], (err) => {
                if (err) {
                    console.error("Error deleting meeting:", err);
                    return res.status(500).json({ message: 'Error deleting meeting' });
                }

                // Final response
                res.status(200).json({ message: 'Meeting and all related data deleted successfully' });
            });
        });
    });
};


exports.getMeetings = (req, res) => {
    Meeting.findAll((err, meetings) => {
        if (err) return res.status(500).json({ message: 'Error fetching meetings', error: err });
        res.json(meetings);
    });
};

// Get meeting by ID with its minutes and tasks
exports.getMeetingByEmail = (req, res) => {
    const { id } = req.params;

    Meeting.findById(id, (err, meeting) => {
        if (err) return res.status(500).json({ message: 'Error fetching meeting', error: err });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json(meeting);
    });
};
exports.getMeetingByCreateUser= (req, res) => {
    const { id } = req.params;

    Meeting.findByUserId(id, (err, meeting) => {
        if (err) return res.status(500).json({ message: 'Error fetching meeting', error: err });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json(meeting);
    });
};
exports.getMeetingById = (req, res) => {
    const { id } = req.params;

    Meeting.findById(id, (err, meeting) => {
        if (err) return res.status(500).json({ message: 'Error fetching meeting', error: err });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json(meeting);
    });
};
