import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { Users, LogOut, Clock, History, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'active', 'past', 'create'
    const [formData, setFormData] = useState({ type: 'student', name: '', identifier: '', password: '' });
    const [status, setStatus] = useState({ message: '', error: false });

    // Session State
    const [activeSessions, setActiveSessions] = useState([]);
    const [pastSessions, setPastSessions] = useState([]);
    const [newSession, setNewSession] = useState({ examName: '', examDate: new Date().toISOString().split('T')[0], examTime: new Date().toTimeString().split(' ')[0].substring(0, 5) });

    const fetchSessions = async () => {
        try {
            const res = await api.get('/admin/sessions');
            setActiveSessions(res.data.active);
            setPastSessions(res.data.past);
        } catch (error) { console.error("Failed to fetch sessions"); }
    };

    useEffect(() => {
        if (activeTab !== 'users') fetchSessions();
    }, [activeTab]);

    const handleProvisionUser = async (e) => {
        e.preventDefault();
        setStatus({ message: 'Provisioning...', error: false });
        try {
            const endpoint = formData.type === 'student' ? '/admin/users/student' : '/admin/users/invigilator';
            const payload = formData.type === 'student'
                ? { name: formData.name, enrollmentNo: formData.identifier, password: formData.password }
                : { name: formData.name, username: formData.identifier, password: formData.password, role: 'INVIGILATOR' };

            await api.post(endpoint, payload);
            setStatus({ message: `${formData.type === 'student' ? 'Student' : 'Invigilator'} created successfully!`, error: false });
            setFormData({ type: 'student', name: '', identifier: '', password: '' });
        } catch (error) {
            setStatus({ message: error.response?.data?.error || 'Failed to create user', error: true });
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/sessions', newSession);
            setNewSession({ examName: '', examDate: new Date().toISOString().split('T')[0], examTime: new Date().toTimeString().split(' ')[0].substring(0, 5) });
            setActiveTab('active');
        } catch (error) { alert('Failed to create session.'); }
    };

    const SessionCard = ({ session, isActive }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{session.examName}</h3>
                    <p className="text-sm text-slate-500">{session.examDate} at {session.examTime}</p>
                    <p className="text-xs text-slate-400 mt-1">Created By: {session.admin?.name} ({session.admin?.role})</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {isActive ? 'ACTIVE' : 'EXPIRED'}
                </span>
            </div>
            {isActive && (
                <div className="flex gap-4 mt-4 border-t border-slate-100 pt-4">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl text-center border border-slate-200 flex flex-col items-center justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Scan to mark attendance</p>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <QRCodeSVG value={session.qrCode} size={120} />
                        </div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl text-center flex-1 flex flex-col justify-center">
                        <h4 className="text-3xl font-mono font-bold tracking-[0.2em] text-white">{session.tempCode}</h4>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-emerald-600 bg-clip-text text-transparent">EFS-SAS</h1>
                    <p className="text-xs text-slate-500 mt-1">Admin Portal</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-4">User Admin</p>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-brand-50 text-brand-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <Users size={20} className={`mr-3 ${activeTab === 'users' ? 'text-brand-500' : 'text-slate-400'}`} /> Manage Users
                    </button>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-6">Exam Control</p>
                    <button onClick={() => setActiveTab('active')} className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-brand-50 text-brand-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <Clock size={20} className={`mr-3 ${activeTab === 'active' ? 'text-brand-500' : 'text-slate-400'}`} /> Active Sessions
                    </button>
                    <button onClick={() => setActiveTab('past')} className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'past' ? 'bg-brand-50 text-brand-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <History size={20} className={`mr-3 ${activeTab === 'past' ? 'text-brand-500' : 'text-slate-400'}`} /> All Past Sessions
                    </button>
                    <button onClick={() => setActiveTab('create')} className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-brand-50 text-brand-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <PlusCircle size={20} className={`mr-3 ${activeTab === 'create' ? 'text-brand-500' : 'text-slate-400'}`} /> Create Session
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => dispatch(logout())} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                        <LogOut size={20} className="mr-3" /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        {activeTab === 'users' && 'Provision New User'}
                        {activeTab === 'active' && 'System-Wide Active Sessions'}
                        {activeTab === 'past' && 'System-Wide Past Sessions'}
                        {activeTab === 'create' && 'Initiate New Session'}
                    </h2>
                </header>

                <div className="max-w-2xl">
                    {activeTab === 'users' && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            {status.message && (
                                <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${status.error ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                                    {status.message}
                                </div>
                            )}
                            <form onSubmit={handleProvisionUser} className="space-y-6">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" name="type" checked={formData.type === 'student'} onChange={() => setFormData({ ...formData, type: 'student' })} /> Student</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="type" checked={formData.type === 'invigilator'} onChange={() => setFormData({ ...formData, type: 'invigilator' })} /> Invigilator</label>
                                </div>
                                <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                <input type="text" placeholder={formData.type === 'student' ? "Enrollment Number" : "Username"} required value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                <input type="password" placeholder="Initial Password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all w-full">Create User</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'active' && activeSessions.map(s => <SessionCard key={s.examSessionId} session={s} isActive={true} />)}
                    {activeTab === 'active' && activeSessions.length === 0 && <p className="text-slate-500">No active sessions.</p>}

                    {activeTab === 'past' && pastSessions.map(s => <SessionCard key={s.examSessionId} session={s} isActive={false} />)}
                    {activeTab === 'past' && pastSessions.length === 0 && <p className="text-slate-500">No past sessions.</p>}

                    {activeTab === 'create' && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <form onSubmit={handleCreateSession} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Exam Subject / Name</label>
                                    <input type="text" required placeholder="e.g. Data Structures 101" value={newSession.examName} onChange={(e) => setNewSession({ ...newSession, examName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                                        <input type="date" required value={newSession.examDate} onChange={(e) => setNewSession({ ...newSession, examDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                                        <input type="time" required value={newSession.examTime} onChange={(e) => setNewSession({ ...newSession, examTime: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all">Start Session Now</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;