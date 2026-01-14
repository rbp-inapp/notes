import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { LogIn, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await auth.login(username, password);
            localStorage.setItem('token', data.access_token);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
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
                        <User size={32} color="#8b5cf6" />
                    </div>
                </div>

                <h2>Notiiiii</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Login to access your notes
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
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Logging in...' : (
                            <>
                                <LogIn size={18} /> Login
                            </>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
