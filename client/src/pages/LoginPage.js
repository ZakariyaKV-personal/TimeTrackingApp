// pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            login(data.accessToken, data.refreshToken, data.user);
            navigate(data.user.role === 'superadmin' ? '/dashboard' : '/dashboard');
        } catch (err) {
            // Check if the error is from the response and display it
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message); // Display the message from the server
            } else {
                console.error('Login failed', err);
                alert("An error occurred during login. Please try again.");
            }
        }
    };


    return (
        <div id="auth">
            <div className="row h-100">
                <div className="col-lg-5 col-12">
                    <div id="auth-left">
                        <div className="auth-logo">
                            <a href="index.html"><img src="assets/images/ANC-Logo.svg" alt="Logo"/></a>
                        </div>
                        <h1 className="auth-title">Log in Atom</h1>
                        <p className="auth-subtitle mb-5">Log in Atom with your data that you entered during registration.</p>

                        <form onSubmit={handleLogin}>
                            <div className="form-group position-relative has-icon-left mb-4">
                                <InputField
                                    label="Email"
                                    type="email"
                                    className="form-control form-control-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
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
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block btn-lg shadow-lg mt-5">Login</button>
                        </form>
                        <div className="text-center mt-5 text-lg fs-4">
                            <p className="text-gray-600">Don't have an account? <Link to="/register"
                                className="font-bold">Sign up</Link>.</p>
                            {/* <p><Link className="font-bold" to="#">Forgot password?</Link>.</p> */}
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

export default LoginPage;
