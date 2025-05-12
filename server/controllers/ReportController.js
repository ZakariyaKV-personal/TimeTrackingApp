const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');

exports.getMonthlyReports = async (req, res) => {
    const { month, year, user } = req.query;

    // Fetch the time entries for the specified month and year from the database
    TimeEntry.getMonthlyEntries(month, year, user, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        // Create a map of user_id to user name (assuming you are using user_id in results)
        const userMap = {}; // Map to store user_id to userName mapping
        results.forEach(entry => {
            // If user name is not already stored, add it to the map
            if (!userMap[entry.user_id]) {
                userMap[entry.user_id] = entry.userName; // Assuming entry.userName is the user name
            }
        });

        // Map the results to group by user, project, and date, aggregating the total hours
        const reports = results.reduce((acc, entry) => {
            // Use the user_id to fetch the user name from the userMap
            const userName = userMap[entry.user_id] || 'Unknown User';

            // Extract the hours and minutes from the totalTime string
            const timeMatch = entry.totalTime.match(/(\d+) hours (\d+) minutes/);
            if (timeMatch) {
                const hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);

                // Format the time as `hours.minutes` (e.g., `7.43` for 7 hours 43 minutes)
                const totalHoursInHMFormat = `${hours}.${minutes.toString().padStart(2, '0')}`;

                // Check if user already exists in the accumulator
                if (!acc[userName]) {
                    acc[userName] = {};
                }

                // If the project doesn't exist for this user, initialize it
                if (!acc[userName][entry.project_name]) {
                    acc[userName][entry.project_name] = {};
                }

                // If the date doesn't exist for this project and user, initialize it
                if (!acc[userName][entry.project_name][entry.date]) {
                    acc[userName][entry.project_name][entry.date] = { 
                        totalHours: [],
                        entries: []  // Store individual entries for that date
                    };
                }

                // Add the formatted total hours (e.g., "7.43") for this project, user, and date
                acc[userName][entry.project_name][entry.date].totalHours.push(totalHoursInHMFormat);

                // Store the individual entry with title, task name, start time, and end time
                acc[userName][entry.project_name][entry.date].entries.push({
                    title: entry.title,
                    task_name: entry.task_name,
                    start_time: entry.start_time,
                    end_time: entry.end_time,
                    date: new Date(entry.date).toLocaleDateString(),  // Format date
                });
            }

            return acc;
        }, {});

        // Format the final report data
        const formattedReports = Object.keys(reports).flatMap(user => {
            return Object.keys(reports[user]).flatMap(project => {
                return Object.keys(reports[user][project]).map(date => {
                    const totalHoursList = reports[user][project][date].totalHours;
                    const entries = reports[user][project][date].entries;

                    // Sum all total hours in `HH.MM` format for that day by appending strings
                    const totalHoursFormatted = totalHoursList.join(" + ");

                    return {
                        user: user,  // User name
                        project: project,  // Project name
                        date: date,  // Date formatted
                        totalHours: totalHoursFormatted, // Total hours in HH.MM format
                        entries: entries // All individual entries for the day
                    };
                });
            });
        });

        // Send the formatted reports
        res.json(formattedReports);
    });
};
