import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MySchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/schedules/my-schedule');
        setSchedule(res.data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "Connection Error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    const newDays = [...schedule.workingDays];
    newDays[dayIndex].isAvailable = !newDays[dayIndex].isAvailable;
    setSchedule({ ...schedule, workingDays: newDays });
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newDays = [...schedule.workingDays];
    newDays[dayIndex][field] = value;
    setSchedule({ ...schedule, workingDays: newDays });
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      await api.put('/schedules/update', schedule);
      alert('Schedule updated and synced!');
    } catch (err) {
      alert('Error updating schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">Loading schedule...</div>;

  if (error) return (
    <div className="p-20 text-center space-y-4">
      <div className="text-4xl">❌</div>
      <h2 className="text-xl font-black text-red-600">Error Loading Schedule</h2>
      <p className="text-gray-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">RETRY</button>
    </div>
  );

  if (!schedule) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Schedule</h1>
          <p className="text-gray-500">Define your clinical availability.</p>
        </div>
        <button 
          onClick={saveSchedule}
          disabled={isSaving}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {schedule?.workingDays?.map((day: any, i: number) => (
          <div key={day.day || i} className={`p-8 flex items-center justify-between border-b border-gray-50 ${day.isAvailable ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => handleToggleDay(i)}
                className={`w-14 h-8 rounded-full relative transition-colors ${day.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${day.isAvailable ? 'left-7' : 'left-1'}`}></div>
              </button>
              <h3 className="font-black text-gray-900 text-lg">{day.day}</h3>
            </div>
            {day.isAvailable && (
              <div className="flex items-center space-x-4">
                <input type="time" value={day.startTime} onChange={e => handleTimeChange(i, 'startTime', e.target.value)} className="p-3 bg-gray-50 rounded-xl font-bold" />
                <span className="text-gray-300">→</span>
                <input type="time" value={day.endTime} onChange={e => handleTimeChange(i, 'endTime', e.target.value)} className="p-3 bg-gray-50 rounded-xl font-bold" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySchedule;
