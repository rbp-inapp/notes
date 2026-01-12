import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length > 72) {
            setError('Password must be less than 72 characters');
            setLoading(false);
            return;
        }

        try {
            await auth.register(username, password);
            // Auto login or redirect to login
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 400) {
                setError('Username already exists');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
            <div className="auth-container glass-panel fade-in">
                <div className="flex-center" style={{ marginBottom: '1rem' }}>
                    <div className="flex-center" style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem'
                    }}>
                        <UserPlus size={32} color="#8b5cf6" />
                    </div>
                </div>

                <h2>Create Account</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Join us to start taking notes
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Choose a password"
                            required
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : (
                            <>
                                <UserPlus size={18} /> Register
                            </>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
