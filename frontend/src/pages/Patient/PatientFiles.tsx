import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PatientFiles: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('Lab Test');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/files/patient/${user.id}`);
      setFiles(res.data || []);
    } catch (err: any) {
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      fetchFiles();
    } catch (err: any) {
      alert('Error deleting document: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', fileType);

    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('File synchronized successfully! ✅');
      setSelectedFile(null);
      fetchFiles();
    } catch (err: any) {
      alert('Technical issue with upload. Please try a different file format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">Clinical Vault</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Personal Scans & Lab Results</p>
        </div>
        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Encrypted Storage</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 space-y-8">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest border-b border-gray-50 pb-6">Upload Diagnostic Data</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Document Category</label>
                <select value={fileType} onChange={e => setFileType(e.target.value)} className="w-full p-5 bg-gray-50 rounded-[1.5rem] border-none outline-none font-black text-gray-700 text-sm appearance-none cursor-pointer">
                  <option value="Lab Test">Laboratory Test (تحاليل)</option>
                  <option value="Scan">Medical Scan (أشعة)</option>
                  <option value="Prescription">Historical RX</option>
                  <option value="Other">Miscellaneous</option>
                </select>
              </div>
              <div className="border-4 border-dashed border-gray-50 rounded-[2.5rem] p-12 text-center hover:border-blue-200 transition-all cursor-pointer relative group">
                <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📁</div>
                <p className="text-xs font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{selectedFile ? selectedFile.name : 'Drop file or click here'}</p>
              </div>
              <button 
                type="submit" 
                disabled={!selectedFile || isUploading}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-600/30 disabled:bg-gray-100 disabled:text-gray-300 uppercase tracking-widest text-xs transition-all hover:bg-blue-700"
              >
                {isUploading ? 'SYNCING DATA...' : 'UPLOAD TO VAULT'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-8">Medical Document</th>
                  <th className="px-10 py-8">Category</th>
                  <th className="px-10 py-8">Date</th>
                  <th className="px-10 py-8 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {files.map((file, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-10 py-8 font-black text-gray-900 group-hover:text-blue-600 transition-colors">{file.fileName}</td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest">{file.fileType}</span>
                    </td>
                    <td className="px-10 py-8 text-[10px] font-bold text-gray-400">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <a href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noreferrer" className="inline-block p-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/10">View</a>
                      <button onClick={() => handleDelete(file._id || file.id)} className="p-3 bg-red-50 text-red-500 rounded-xl text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer" title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {files.length === 0 && !loading && (
              <div className="py-24 text-center">
                <div className="text-4xl opacity-10 mb-4">🗄️</div>
                <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Your clinical vault is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFiles;




