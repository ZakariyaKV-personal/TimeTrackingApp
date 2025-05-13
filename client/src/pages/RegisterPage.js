import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');  // Default role
    const navigate = useNavigate();
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://timetrackingapp.onrender.com';

    // List of common domains to block
    const disallowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

    const handleRegister = async (e) => {
        e.preventDefault();

        if (isDisallowedDomain(email)) {
            alert('Registration is restricted to business domains only.');
            return;
        }

        const response = await fetch(`${serverUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        if (response.ok) {
            navigate('/'); // Redirect to Login Page
        } else {
            alert('Registration failed');
        }
    };

    const isDisallowedDomain = (email) => {
        const emailDomain = email.split('@')[1];
        return disallowedDomains.includes(emailDomain);
    };

    return (
        <div id="auth">
            <div className="row h-100">
                <div className="col-lg-5 col-12">
                    <div id="auth-left">
                        <div className="auth-logo">
                            <a href="index.html"><img src="assets/images/ANC-Logo.svg" alt="Logo"/></a>
                        </div>
                        <h1 className="auth-title">Sign Up Atom</h1>
                        <p className="auth-subtitle mb-5">Input your data to register to our website.</p>

                        <form onSubmit={handleRegister}>
                            <div className="form-group position-relative has-icon-left mb-4">
                                <InputField 
                                    label="Name" 
                                    type="text" 
                                    className="form-control form-control-xl"
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Enter your name" 
                                />
                            </div>
                            <div className="form-group position-relative has-icon-left mb-4">
                            <InputField 
                                label="Email" 
                                className="form-control form-control-xl"
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter your email" 
                                required
                            />
                            </div>
                            <div className="form-group position-relative has-icon-left mb-4">
                            <InputField 
                                label="Password" 
                                type="password" 
                                className="form-control form-control-xl"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter your password" 
                                required
                            />
                            </div>

                            <div className="form-group position-relative has-icon-left mb-4">
                                <label htmlFor="role">Role</label>
                                <select 
                                    id="role" 
                                    className="form-control form-control-xl"
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="">Select User Role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block btn-lg shadow-lg mt-5">Sign Up</button>
                        </form><div className="text-center mt-5 text-lg fs-4">
                            <p className="text-gray-600">Already have an account? <Link to="/"
                                className="font-bold">Sign In</Link>.</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 d-none d-lg-block">
                    <div id="auth-right">

                    </div>
                </div>
            </div>

        </div>
    );
};

export default RegisterPage;
