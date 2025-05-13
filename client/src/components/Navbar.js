// components/Navbar.js
import React, { useState/*, useEffect*/ } from 'react';
import { Link, useLocation  } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    // const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(null);

    // Fetch pending leaves count for logged-in user's domain
    // useEffect(() => {
    //     if (isAuthenticated && user) {
    //         const fetchPendingLeavesCount = async () => {
    //             try {
    //                 const response = await axios.get(`/api/leaves/pending-leaves-count/${user.email}`);
    //                 setPendingLeavesCount(response.data.count);
    //             } catch (error) {
    //                 console.error('Error fetching pending leaves count:', error);
    //             }
    //         };
    //         fetchPendingLeavesCount();
    //     }
    // }, [isAuthenticated, user]);

    const location = useLocation();  // Use this hook to get the current route
    function isActive(path) {
        // Check if the current path starts with the given path
        return location.pathname.startsWith(path);
    }
    

    const handleToggle = (item) => {
        if (activeItem === item) {
            // Toggle off if clicking the same item
            setIsOpen(false);
            setActiveItem(null);
        } else {
            // Set only the clicked item active
            setIsOpen(true);
            setActiveItem(item);
        }
    };
    
    const isSubmenuActive = (paths) => {
        return paths.includes(location.pathname);
    };

    // Close other items and set the clicked item as active
    const handleSidebarItemClick = (item) => {
        setActiveItem(item);
        setIsOpen(false);  // Close any open submenu
    };

    return (
        <div id="sidebar" className="active">
            <div className="sidebar-wrapper active">
                <div className="sidebar-header">
                    <div className="d-flex justify-content-between">
                        <div className="logo">
                            <Link to="#"><img src={`https://timetrackingapp.onrender.com/assets/images/ANC-Logo.svg`} alt="Logo" srcset="" /></Link>
                        </div>
                        <div className="toggler">
                            <Link to="#" className="sidebar-hide d-xl-none d-block"><i className="bi bi-x bi-middle"></i></Link>
                        </div>
                    </div>
                </div>
                <div className="sidebar-menu">
                    <ul className="menu">
                        <li className="sidebar-title">Main Menu</li>

                        {isAuthenticated && user ? (
                            user.role !== 'superadmin' && user.role !== 'admin' ? (
                                <>
                                    <li className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>
                                        <Link to="/dashboard" className='sidebar-link'>
                                            <i className="bi bi-grid-fill"></i>
                                            <span>Time Sheets</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}>
                                        <Link to="/profile" className='sidebar-link'>
                                            <i className="bi bi-person-fill"></i>
                                            <span>Profile</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/user-projects') || isActive('/user-tasks') ? 'active' : ''}`}>
                                        <Link to="/user-projects" className="sidebar-link">
                                            <i className="bi bi-list-task"></i>
                                            <span>Projects/Tasks</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/calendar') ? 'active' : ''}`}>
                                        <Link to="/calendar" className='sidebar-link'>
                                            <i className="bi bi-calendar-check-fill"></i>
                                            <span>Calendar</span>
                                        </Link>
                                    </li>
                                    {/* <li className={`sidebar-item ${isActive('/leave')}`}>
                                        <Link to="/leave" className='sidebar-link'>
                                            <i className="bi bi-dice-5-fill"></i>
                                            <span>Applied Leaves</span>
                                        </Link>
                                    </li> */}
                                </>
                            ) : (
                                <>
                                    <li className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>
                                        <Link to="/dashboard" className='sidebar-link' onClick={() => handleSidebarItemClick('dashboard')}>
                                            <i className="bi bi-grid-fill"></i>
                                            <span>Time Sheets</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}>
                                        <Link to="/profile" className='sidebar-link' onClick={() => handleSidebarItemClick('profile')}>
                                            <i className="bi bi-person-fill"></i>
                                            <span>Profile</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/user-projects') || isActive('/user-tasks') ? 'active' : ''}`}>
                                        <Link to="/user-projects" className='sidebar-link' onClick={() => handleSidebarItemClick('user-projects')}>
                                            <i className="bi bi-list-task"></i>
                                            <span>Assigned Projects/Tasks</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/calendar') ? 'active' : ''}`}>
                                        <Link to="/calendar" className='sidebar-link' onClick={() => handleSidebarItemClick('calendar')}>
                                            <i className="bi bi-calendar-check-fill"></i>
                                            <span>Calendar</span>
                                        </Link>
                                    </li>
                                    {user.role ==='superadmin'? (
                                    <li className={`sidebar-item ${isActive('/users') ? 'active' : ''}`}>
                                        <Link to="/users" className='sidebar-link' onClick={() => handleSidebarItemClick('users')}>
                                            <i className="bi bi-people-fill"></i>
                                            <span>Employees</span>
                                        </Link>
                                    </li>
                                    ):''}
                                    <li className={`sidebar-item ${isActive('/projects') ? 'active' : ''}`}>
                                        <Link to="/projects" className='sidebar-link' onClick={() => handleSidebarItemClick('projects')}>
                                            <i className="bi bi-kanban-fill"></i>
                                            <span>Projects</span>
                                        </Link>
                                    </li>
                                    
                                    <li className={`sidebar-item ${isActive('/tasks') ? 'active' : ''}`}>
                                        <Link to="/tasks" className='sidebar-link' onClick={() => handleSidebarItemClick('tasks')}>
                                            <i className="bi bi-list-task"></i>
                                            <span>Tasks</span>
                                        </Link>
                                    </li>
                                    {/* <li className={`sidebar-item ${isActive('/commonleave')}`}>
                                        <Link to="/commonleave" className='sidebar-link'>
                                            <i className="bi bi-bar-chart"></i>
                                            <span>Common Leaves</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/appliedleave')}`}>
                                        <Link to="/appliedleave" className='sidebar-link'>
                                            <i className="bi bi-dice-5-fill"></i>
                                            <span>Applied Leaves {pendingLeavesCount > 0 && <span className='user-count'>({pendingLeavesCount})</span>}</span>
                                        </Link>
                                    </li> */}
                                    <li className={`sidebar-item has-sub ${isOpen || isSubmenuActive(['/reports', '/taskreports']) ? 'active' : ''}`}>
                                        <Link to="#" onClick={handleToggle} className={`sidebar-link ${isOpen || isSubmenuActive(['/reports', '/taskreports']) ? 'active' : ''}`}>
                                            <i className="bi bi-grid-fill"></i>
                                            <span>Reports</span>
                                        </Link>
                                        <ul className={`submenu ${isOpen || isSubmenuActive(['/reports', '/taskreports']) ? 'active' : ''}`}>
                                            <li className={`submenu-item ${location.pathname === '/reports' ? 'active' : ''}`}>
                                            <Link to="/reports">Time Sheet Reports</Link>
                                            </li>
                                            <li className={`submenu-item ${location.pathname === '/taskreports' ? 'active' : ''}`}>
                                            <Link to="/taskreports">Task Reports</Link>
                                            </li>
                                        </ul>
                                    </li>
                                    
                                </>
                            )) : ''}
                            {isAuthenticated && (
                                <>
                                    <li className="sidebar-title">Meeting in minutes</li>
                                    <li className={`sidebar-item ${isActive('/meetings') || isActive('/viewmeeting')  ? 'active' : ''}`}>
                                        <Link to="/meetings" className='sidebar-link' onClick={() => handleSidebarItemClick('meetings')}>
                                            <i className="bi bi-binoculars-fill"></i>
                                            <span>Your Meetings</span>
                                        </Link>
                                    </li>
                                    <li className={`sidebar-item ${isActive('/assignedmeetings') ? 'active' : ''}`}>
                                        <Link to="/assignedmeetings" className='sidebar-link' onClick={() => handleSidebarItemClick('assignedmeetings')}>
                                            <i className="bi bi-binoculars-fill"></i>
                                            <span>Assigned Meetings</span>
                                        </Link>
                                    </li>
                                <li className="sidebar-item">
                                <button className="sidebar-link logout-btn" onClick={logout}>Logout</button>
                                </li>
                                </>
                            )}
                    </ul>
                </div>
                <button className="sidebar-toggler btn x"><i data-feather="x"></i></button>
            </div>
        </div>
    );
};

export default Navbar;
