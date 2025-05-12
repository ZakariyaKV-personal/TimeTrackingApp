import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Users from './pages/Users';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import CommonLeaves from './pages/CommonLeaves';
import Leaves from './pages/Leaves';
import AdminAppliedLeaves from './pages/AdminAppliedLeaves';
import UserTasks from './pages/UserTaskList';
import UserProjects from './pages/UserProjectList';
import TaskReports from './pages/TaskReports';
import AddMeetings from './pages/Meetings/AddMeetings';
import ViewMeeting from './pages/Meetings/ViewDetails';
import './App.css';

function AppWithAuth() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div id="app">
        {/* Render Navbar only if authenticated */}
        {isAuthenticated && <Navbar />}

        <div id={isAuthenticated ? "main-content" : "page-content"}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/meetings" element={<ProtectedRoute element={<AddMeetings />} />} />
            <Route path="/calendar" element={<ProtectedRoute element={<Calendar />} />} />
            <Route path="/taskreports" element={<ProtectedRoute element={<TaskReports />} />} />
            <Route path="/commonleave" element={<ProtectedRoute element={<CommonLeaves />} />} />
            <Route path="/appliedleave" element={<ProtectedRoute element={<AdminAppliedLeaves />} />} />
            <Route path="/leave" element={<ProtectedRoute element={<Leaves />} />} />
            <Route path="/users" element={<ProtectedRoute element={<Users />} />} />
            <Route path="/projects" element={<ProtectedRoute element={<Projects />} />} />
            <Route path="/tasks" element={<ProtectedRoute element={<Tasks />} />} />
            <Route path="/user-tasks/:projectId" element={<ProtectedRoute element={<UserTasks />} />} />
            <Route path="/viewmeeting/:meetingId" element={<ProtectedRoute element={<ViewMeeting />} />} />
            <Route path="/user-projects" element={<ProtectedRoute element={<UserProjects />} />} />
            <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
