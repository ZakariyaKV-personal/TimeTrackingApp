import React, { useState, useEffect } from 'react';
import { getTimeEntries } from '../api/timeEntryService';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Calendar = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [commonLeaves, setCommonLeaves] = useState([]);  // State for common leaves
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { userId, isAuthenticated,username, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [leaveType, setLeaveType] = useState('Sick Leave'); // Default leave type
  const [comment, setComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    const fetchEntries = async () => {
      const entries = await getTimeEntries(user.domain);
      setTimeEntries(entries.timeEntries); // Assuming the response includes timeEntries and leaves
      setCommonLeaves(entries.leaves); // Assuming the response includes common leaves
    };
    fetchEntries();
  }, [currentMonth, currentYear, user.domain]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getRandomLightColor = () => {
    const letters = '89ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 7)];
    }
    return color;
  };

  const prepareCalendarData = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const timeGroups = Array.from({ length: daysInMonth }, () => ({}));

    // Process time entries
    timeEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const startTime = entry.start_time.split(":");
      const endTime = entry.end_time.split(":");

      const startMinutes = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
      const endMinutes = parseInt(endTime[0], 10) * 60 + parseInt(endTime[1], 10);

      const totalMinutes = endMinutes - startMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const formattedHours = hours + (minutes / 60);

      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const day = date.getDate() - 1;
        const project = entry.project_name;

        if (!timeGroups[day][project]) {
          timeGroups[day][project] = { hours: 0, color: getRandomLightColor() };
        }
        timeGroups[day][project].hours += formattedHours;
      }
    });

    // Process common leave days globally
    commonLeaves.forEach((leave) => {
      const leaveDate = new Date(leave.leave_date);
      const leaveName = leave.leave_name;  // Capture leave name
      if (leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear) {
        const day = leaveDate.getDate() - 1;
        if (!timeGroups[day].leave) {
          timeGroups[day].leave = { name: leaveName };  // Store leave name
        }
      }
    });

    return timeGroups;
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    if (!leaveType || !selectedDate) return;
    
    try {
      await axios.post('/api/leaves/apply', {
        userId,
        username,
        leaveType,
        leaveComment: comment,
        leaveDate: new Date(selectedDate).toISOString().split('T')[0],
      });
      window.location.reload();  // Refresh the page to reflect the new leave application
    } catch (error) {
      console.error('Error applying leave', error);
    }
  };

  const calendarData = prepareCalendarData();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();
  const daysArray = Array.from({ length: startDayOfWeek }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (daysArray.length % 7 !== 0) {
    daysArray.push(null);
  }
  const toggleModal = (day,monthName,currentYear) => {
    const monthIndex = new Date(Date.parse(`${monthName} ${day}, ${currentYear}`)).getMonth();
    const date = new Date(currentYear, monthIndex, day);
    if (date instanceof Date && !isNaN(date)) {
      // Valid date, set selectedDate
      date.setDate(date.getDate() + 1);  // Adjust date if necessary
      setSelectedDate(date);
      setIsModalOpen(true);  // Open modal
    } else {
      setLeaveType('');
      setComment('');
      setIsModalOpen(false);  // Open modal
    }
  };

  return (
    <div className="container">
      <div className="user-summary">
        <h2 style={{ textTransform: 'capitalize' }}>Your Calendar</h2>
        <p><strong>Month:</strong> {monthName} {currentYear}</p>
        <button onClick={handlePrevMonth}>Previous Month</button>
        <button onClick={handleNextMonth}>Next Month</button>
        <div className="calendar">
          <div className="calendar-grid">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {daysArray.map((day, i) => {
              const isWeekend = i % 7 === 0 || i % 7 === 6;
              const dayProjects = day ? calendarData[day - 1] : {};
              const currentDate = new Date(currentYear, currentMonth, day);
              const isPastOrToday = currentDate <= today;
              const isAbsent = day && Object.keys(dayProjects).length === 0 && isPastOrToday;
              const isLeave = day && dayProjects.leave;
              const isToday = currentDate.toDateString() === today.toDateString();
              const hasWorkEntries = day && Object.keys(dayProjects).length > 0;
            
              // Determine classes for different styles
              const dayClasses = [
                'calendar-day',
                isWeekend ? 'weekend' : '',
                isLeave ? 'leave' : '',
                isAbsent && !isLeave ? 'absent' : '',
                hasWorkEntries ? 'work-day' : '',  // Class for days with work entries
                isToday ? 'today' : '', 
                !day ? 'noDay' : '',           // Class for today
              ].join(' ');
              // Calculate total hours for the day
              let formattedTotalTime = "0:00";  // Initialize formattedTotalTime as a string

              if (day) {
                // Calculate total hours as a decimal
                const totalHoursForDay = Object.values(dayProjects).reduce((sum, project) => sum + project.hours, 0);

                // Separate into hours and minutes
                const integerHours = Math.floor(totalHoursForDay);
                const decimalMinutes = Math.round((totalHoursForDay - integerHours) * 60);

                // Format as "HH:MM"
                formattedTotalTime = `${integerHours}:${decimalMinutes.toString().padStart(2, '0')}`;
              }

              // Now you can use formattedTotalTime outside of the block

              return (
                <div
                  key={i}
                  className={dayClasses}
                  onDoubleClick={() => toggleModal(day, monthName, currentYear)}
                >
                  <div className="day-column">
                    {day && (
                      <>
                        <div className="day-number">{day}</div>
                        <div className="projects-worked">
                          {isLeave ? (
                            <span>Common Leave</span>
                          ) : !isAbsent && Object.keys(dayProjects).length > 0 && isPastOrToday ? (
                            Object.entries(dayProjects).map(([project, { hours, color }]) => {
                              const integerHours = Math.floor(hours);
                              const decimalMinutes = Math.round((hours - integerHours) * 60);  // Convert decimal to minutes

                              // Format as "HH:MM"
                              const formattedTime = `${integerHours}:${decimalMinutes.toString().padStart(2, '0')}`;
                              const adjustedHours = Math.min(8, hours);
                              const barWidth = `${(adjustedHours / 8) * 100}%`;

                              return (
                                <div key={project} style={{ marginBottom: '5px', padding: '0px', position: 'relative', width: barWidth }}>
                                  <div className="project-bar" style={{
                                      width: '100%',
                                      height: '20px',
                                      backgroundColor: color,
                                      borderRadius: '0px',
                                      opacity: 0.8,
                                      position: 'relative',
                                  }}>
                                    <div className="hover-info">
                                      <strong>{project}:</strong> {formattedTime} hrs
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : isWeekend && Object.keys(dayProjects).length === 0 ? (
                            <span>Public Holiday</span>
                          ) : isPastOrToday && !isWeekend && Object.keys(dayProjects).length === 0 && !isToday? (
                            <span>Absent</span>
                          ) : ''}
                        </div>

                        {!isAbsent && !isWeekend && isPastOrToday && today && !isLeave ? (
                          <div className="total-hours" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            {formattedTotalTime} hrs
                          </div>
                        ) : isWeekend && Object.keys(dayProjects).length !== 0 && !isLeave ? (
                          <div className="total-hours" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            {formattedTotalTime} hrs
                          </div>
                        ) : isLeave ? (
                          <div className="total-hours" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            {dayProjects.leave.name}
                          </div>
                        ) : ''}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
      {isModalOpen && (
          <div className="modal-overlay" onClick={toggleModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Apply for Leave</h2>
              <form onSubmit={handleLeaveSubmit}>
              <div>
              <label>Leave Type:</label>
                <select
                className='form-control'
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)} required
                >
                  <option value="">Select Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label>Comment:</label>
                <textarea
                className='form-control'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  placeholder="Add a comment"
                  required
                />
              </div>
              <div>
                <p>Selected Date: {new Date(selectedDate).toISOString().split('T')[0]}</p>
              </div>
              <button type='submit'>Submit Leave</button>
              <button type="button" onClick={toggleModal}>Cancel</button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default Calendar;
