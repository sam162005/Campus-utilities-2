import React, { useState } from 'react';
import api from '../../services/api';

const AuthPage = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [showOtpInput, setShowOtpInput] = useState(false); // New state to control OTP input visibility
    const [otp, setOtp] = useState(''); // New state for OTP
    const [registrationEmail, setRegistrationEmail] = useState(''); // To store email during OTP verification
    const [isOtpSent, setIsOtpSent] = useState(false); // To indicate if OTP has been sent

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        // Email format validation (example: "sam.j2023it@sece.ac.in")
        const emailRegex = /^[a-zA-Z]+\.[a-zA-Z0-9]+@sece\.ac\.in$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please use your official college email ID (e.g., sam.j2023it@sece.ac.in).');
            return;
        }

        try {
            // Store the email that sent the OTP for later verification
            setRegistrationEmail(formData.email);
            const res = await api.post('/auth/send-otp', { email: formData.email });
            setIsOtpSent(true);
            setShowOtpInput(true); // Show OTP input after sending
            setError(''); // Clear any previous errors
            alert(res.data.msg); // Inform the user that OTP has been sent
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP. Please try again.');
        }
    };

    const handleVerifyOtpAndRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/verify-otp-and-register', {
                email: registrationEmail, // Use the stored email
                otp,
                name: formData.name,
                password: formData.password,
                role: 'student' // Ensure role is always student for registration
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            alert('Registration successful! You are now logged in.');
            // Optionally, clear form data and reset states after successful registration
            setFormData({ name: '', email: '', password: '', role: 'student' });
            setOtp('');
            setShowOtpInput(false);
            setIsOtpSent(false);
            setIsLogin(true); // Navigate to login box implicitly by setting isLogin to true
        } catch (err) {
            setError(err.response?.data?.msg || 'OTP verification failed or registration error. Please try again.');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const submissionData = { ...formData, role: isLogin ? formData.role : 'student' }; // Retain role for login

        try {
            const res = await api.post('/auth/login', submissionData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred during login.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-cyan-400">CampusLink</h1>
                    <p className="mt-2 text-gray-400">Your Centralized Student Hub</p>
                </div>
                <form className="space-y-4" onSubmit={isLogin ? handleLoginSubmit : (showOtpInput ? handleVerifyOtpAndRegister : handleSendOtp)}>
                    <h2 className="text-2xl font-semibold text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>

                    {!isLogin && (
                        <>
                            <input name="name" onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="text" placeholder="Full Name" value={formData.name} required={!isLogin} disabled={showOtpInput} />
                            <input name="email" onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="email" placeholder="Official College Email (e.g., sam.j2023it@sece.ac.in)" value={formData.email} required={!isLogin} disabled={showOtpInput} />
                            <input name="password" onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="password" placeholder="Password" value={formData.password} required={!isLogin} disabled={showOtpInput} />
                        </>
                    )}

                    {isLogin && (
                        <>
                            <input name="email" onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="email" placeholder="Email Address" value={formData.email} required />
                            <input name="password" onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="password" placeholder="Password" value={formData.password} required />
                        </>
                    )}

                    {/* Role selection for login only */}
                    {isLogin && (
                        <select name="role" onChange={handleChange} value={formData.role} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    )}

                    {!isLogin && showOtpInput && (
                        <input name="otp" onChange={handleOtpChange} value={otp} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" type="text" placeholder="Enter OTP" required />
                    )}

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button type="submit" className="w-full py-3 font-semibold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors">
                        {isLogin ? 'Login' : (showOtpInput ? 'Verify OTP & Register' : 'Send OTP')}
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setFormData({ name: '', email: '', password: '', role: 'student' });
                        setShowOtpInput(false);
                        setOtp('');
                        setRegistrationEmail('');
                        setIsOtpSent(false);
                    }} className="ml-2 font-semibold text-cyan-400 hover:underline">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;