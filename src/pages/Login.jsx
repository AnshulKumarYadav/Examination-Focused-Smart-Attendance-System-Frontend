import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../features/authSlice';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [loginType, setLoginType] = useState('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, role, error, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token && role) {
            const activeRole = String(role).toUpperCase();
            
            console.log("Login Successful! Routing for role:", activeRole); 

            if (activeRole === 'STUDENT') {
                navigate('/student');
            } else if (activeRole === 'ADMIN' || activeRole === 'SUPERADMIN') {
                navigate('/admin');
            } else if (activeRole === 'INVIGILATOR') {
                navigate('/invigilator');
            } else {
                console.error("Unrecognized role received from backend:", activeRole);
            }
        }
    }, [token, role, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const credentials = {
            type: loginType,
            data: loginType === 'student'
                ? { enrollmentNo: identifier, password }
                : { username: identifier, password }
        };
        dispatch(loginUser(credentials));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-500 to-emerald-600 bg-clip-text text-transparent">EFS-SAS</h1>
                    <p className="text-slate-500 mt-2 text-sm">Examination-Focused Smart Attendance</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setLoginType('student')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginType === 'student' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => setLoginType('admin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginType === 'admin' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
                    >
                        Staff / Admin
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error.error || 'Login failed'}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            placeholder={loginType === 'student' ? 'Enrollment Number' : 'Username'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;