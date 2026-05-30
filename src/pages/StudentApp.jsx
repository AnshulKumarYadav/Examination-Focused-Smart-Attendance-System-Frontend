import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { ScanLine, LogOut, History } from 'lucide-react';
import api from '../services/api';
import { Scanner } from '@yudiel/react-qr-scanner';

const StudentApp = () => {
    const dispatch = useDispatch();

    const [qrCodeData, setQrCodeData] = useState('');
    const [tempCode, setTempCode] = useState('');
    const [status, setStatus] = useState({ message: '', error: false });
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // New State for tabs and history
    const [activeTab, setActiveTab] = useState('scan');
    const [history, setHistory] = useState([]);

    // Safely extract enrollment number from token
    const token = localStorage.getItem('token');
    const enrollmentNo = token ? JSON.parse(atob(token.split('.')[1])).sub : 'Unknown';

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/student/attendance/${enrollmentNo}`);
            setHistory(res.data);
        } catch (error) {
            console.error("Could not fetch history");
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: '', error: false });

        try {
            const payload = {
                enrollmentNo: enrollmentNo,
                qrCode: qrCodeData,
                tempCode: tempCode
            };

            const response = await api.post('/student/attendance', payload);
            setStatus({ message: response.data.message || 'Attendance Recorded!', error: false });
            setQrCodeData('');
            setTempCode('');
        } catch (error) {
            setStatus({ message: error.response?.data?.error || 'Verification Failed', error: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
            <header className="bg-white p-6 rounded-b-3xl shadow-sm z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Hi {enrollmentNo} 👋</h1>
                        <p className="text-sm text-slate-500">Welcome to EFS-SAS</p>
                    </div>
                    <button onClick={() => dispatch(logout())} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="flex bg-white mx-6 mt-4 p-1 rounded-xl shadow-sm border border-slate-100 z-10">
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'scan' ? 'bg-brand-50 text-brand-600' : 'text-slate-500'}`}
                >
                    Mark Present
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-brand-50 text-brand-600' : 'text-slate-500'}`}
                >
                    History
                </button>
            </div>

            <main className="flex-1 p-6 flex flex-col pt-4">
                {activeTab === 'scan' ? (
                    <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-500">
                            <ScanLine size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Mark Attendance</h2>

                        {status.message && (
                            <div className={`w-full p-3 mb-4 rounded-xl text-sm font-medium ${status.error ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleMarkAttendance} className="w-full space-y-4">
                            {isScanning ? (
                                <div className="w-full mb-4 rounded-xl overflow-hidden border border-slate-200 relative">
                                    <Scanner
                                        onResult={(text, result) => {
                                            setQrCodeData(text); // Capture the scanned string
                                            setIsScanning(false); // Close the camera automatically
                                        }}
                                        onError={(error) => console.error(error?.message)}
                                        options={{ delayBetweenScanAttempts: 1000 }} // Prevents rapid duplicate scans
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsScanning(false)}
                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm shadow-md"
                                    >
                                        Cancel Scan
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <input
                                        type="text"
                                        required
                                        readOnly
                                        placeholder={qrCodeData ? "QR Code Scanned ✅" : "Tap scan to open camera ->"}
                                        value={qrCodeData}
                                        className={`flex-1 bg-slate-50 border rounded-xl py-3 px-4 text-sm outline-none cursor-not-allowed ${qrCodeData ? 'border-emerald-300 text-emerald-700 font-bold bg-emerald-50' : 'border-slate-200'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQrCodeData(''); // Clear previous scan
                                            setIsScanning(true);
                                        }}
                                        className="bg-brand-100 hover:bg-brand-200 text-brand-600 p-3 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <ScanLine size={24} />
                                    </button>
                                </div>
                            )}
                            <input
                                type="text"
                                required
                                maxLength="6"
                                placeholder="Enter 6-Digit Screen Code"
                                value={tempCode}
                                onChange={(e) => setTempCode(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg font-mono tracking-widest text-center focus:ring-1 focus:ring-brand-500 outline-none"
                            />
                            <button disabled={loading} type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-70 mt-4">
                                {loading ? 'Verifying...' : 'Verify Presence'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[300px]">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <History className="mr-2 text-brand-500" size={20} />
                            Past Records
                        </h2>
                        {history.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center mt-8">No attendance records found.</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map(record => (
                                    <div key={record.attendanceId} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Exam Session #{record.examSession?.examSessionId}</p>
                                            <p className="text-xs font-medium text-slate-500">{new Date(record.verifiedAt).toLocaleDateString()} - {new Date(record.verifiedAt).toLocaleTimeString()}</p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentApp;