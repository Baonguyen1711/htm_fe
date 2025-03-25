import React, { useState } from 'react';
import UploadExam from './UploadTest';
import ViewTest from './ViewTest';
import SetupMatch from './SetUpMatch';
import useAuth from '../../../hooks/useAuth';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const {getToken} = useAuth()

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-center text-3xl font-bold mb-6">Exam Management Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Upload Exam
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 ${activeTab === 'view' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          View Exams
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2 ${activeTab === 'setup' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Setup Match
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'upload' && <UploadExam/>}
        {activeTab === 'view' && <ViewTest getToken={getToken} />}
        {activeTab === 'setup' && <SetupMatch />}
      </div>
    </div>
  );
};

export default App;
