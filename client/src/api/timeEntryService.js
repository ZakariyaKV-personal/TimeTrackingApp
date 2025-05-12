import api from './api';
export const getProjects = async (id) => {
    try {
        const response = await api.get(`/api/projects/byid/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
    }
};


export const getTasks = async (entryId) => {
    try {
        const response = await api.get(`/api/tasks/project/${entryId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
    }
};

export const getTimeEntries = async (domain) => {
    try {
        const response = await api.get(`/api/timeentries/${domain}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch time entries:', error);
        return [];
    }
};

export const createTimeEntry = async (entryData) => {
    try {
        const response = await api.post('/api/timeentries', entryData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        
        // Check if the response status is 201 (Created)
        return response.status === 201;
    } catch (error) {
        console.error('Failed to create time entry:', error);
        return false;
    }
};

export const deleteTimeEntry = async (entryId) => {
    try {
        const response = await api.delete(`/api/timeentries/${entryId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        
        // Check if the response status is in the 2xx range to indicate success
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Failed to delete time entry:', error);
        return false;
    }
};

export const updateTimeEntry = async (entryData, entryId) => {
    try {
        const response = await api.put(`/api/timeentries/${entryId}`, entryData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        });
        return response.status === 200; // Successful update
    } catch (error) {
        console.error('Error updating time entry:', error);
        return false;
    }
};
