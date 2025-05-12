import React, { useState, useEffect } from 'react';
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '../api/timeEntryService';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomTable from '../components/Table';

const Dashboard = () => {
    const [timeEntries, setTimeEntries] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);

    useEffect(() => {
        const fetchTimeEntries = async () => {
            const entries = await getTimeEntries();
            setTimeEntries(entries.timeEntries);
        };
        fetchTimeEntries();
    }, []);

    const handleEditEntry = (entry) => setEditingEntry(entry);

    const handleUpdateEntry = async (entryData, entryId) => {
        const success = await updateTimeEntry(entryData, entryId);
        if (success) {
            window.location.reload(); // Refresh the page to display the updated entry
        } else alert('Failed to update time entry');
    };

    const handleDeleteEntry = async (id) => {
        const success = await deleteTimeEntry(id);
        if (success) {
            window.location.reload(); // Refresh the page to display the updated entry
        } else alert('Failed to delete time entry');
    };

    const handleCreateEntry = async (entryData) => {
        const success = await createTimeEntry(entryData);
        if (success) {
            window.location.reload(); // Refresh the page to display the updated entry
        } else alert('Failed to create time entry');
    };

    const groupByDate = (entries) => {
        // Group entries by date
        const groups = entries.reduce((groups, entry) => {
            const date = new Date(entry.date).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
            return groups;
        }, {});

        // Sort the grouped entries by date in ascending order
        const sortedGroups = Object.keys(groups)
            .sort((a, b) => new Date(b) - new Date(a)) // Sort dates in ascending order
            .reduce((sorted, key) => {
                sorted[key] = groups[key]; // Rebuild the groups object with sorted dates
                return sorted;
            }, {});

        return sortedGroups;
    };

    const calculateTimeWorked = (start, end) => {
        const startTime = new Date(`1970-01-01T${start}Z`);
        const endTime = new Date(`1970-01-01T${end}Z`);
        const diff = (endTime - startTime) / 1000 / 60;
        return { hours: Math.floor(diff / 60), minutes: diff % 60 };
    };

    const calculateTotalTimeForDay = (entries) => {
        let totalMinutes = 0;
        entries.forEach(entry => {
            const { hours, minutes } = calculateTimeWorked(entry.start_time, entry.end_time);
            totalMinutes += hours * 60 + minutes;
        });
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        return { hours: totalHours, minutes: remainingMinutes };
    };

    const headers = ["Description", "Project", "Task", "Status", "Start Time", "End Time", "Actions"];

    return (
        <div className="container">
            <h3>Log Your Time</h3>
            <TimeEntryForm onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry} timeEntryToEdit={editingEntry} />
            {timeEntries.length !== 0? (
            <h3>Time Entries</h3>
            ) : ''}
            {Object.entries(groupByDate(timeEntries)).map(([date, dailyEntries]) => {
                const totalTime = calculateTotalTimeForDay(dailyEntries);
                return (
                    <div key={date}>
                        <p style={{ margin: '30px 0px 14px' }}><b>{date}</b> - Total Time: {totalTime.hours} hours and {totalTime.minutes} minutes</p>
                        <CustomTable
                            headers={headers}
                            data={dailyEntries}
                            renderRow={(entry) => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td>{entry.title}</td>
                                    <td>{entry.project_name}</td>
                                    <td>{entry.task_name}</td>
                                    <td>{entry.status}</td>
                                    <td>{entry.start_time}</td>
                                    <td>{entry.end_time}</td>
                                    <td>
                                        <button onClick={() => handleEditEntry(entry)} className="btn btn-primary">Edit</button>
                                        <button onClick={() => handleDeleteEntry(entry.id)} className="btn btn-danger">Delete</button>
                                    </td>
                                </tr>
                            )}
                            columnWidths={['28%', '15%', '15%', '10%', '10%', '10%', '12%']}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default Dashboard;
