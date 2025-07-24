import React, { useEffect, useState, useRef } from 'react';
import { getTest, getTestByUserId, updateQuestion, addNewQuestion } from './service';
import { uploadFile } from '../../../services/uploadAssestServices';
import { Question } from '../../../type';
import { useQuery } from 'react-query';
import testManageMentService from '../../../services/testManagement.service';

const ViewTest: React.FC = () => {
  const [testList, setTestList] = useState<string[]>([]);
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [isDataExisted, setIsDataExisted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('round_1');
  const [testData, setTestData] = useState<{
    round_1: Question[];
    round_2: Question[];
    round_3: { [key: string]: Question[] };
    round_4: { [key: string]: Question[] };
    turn: Question[];
  }>({
    round_1: [],
    round_2: [],
    round_3: {},
    round_4: {},
    turn: []
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const getTestList = async () => {
      try {
        const testList = await testManageMentService.getTestNameByUser();
        localStorage.setItem("testList", JSON.stringify(testList));
        console.log("test list", testList);
        
        setTestList(testList);
      } catch (error) {
        console.error("Error fetching test list:", error);
      }
    };
    getTestList();
  }, []);

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(event.target.value);
    setIsDataExisted(false);
  };

  const handleViewTest = async () => {
    if (!selectedTestName) {
      alert("Please select a test first!");
      return;
    }
    if (isDataExisted) return;
    try {
      const data = await testManageMentService.getTestContent(selectedTestName);
      console.log("data", data);
      localStorage.setItem("testId", data["round_1"][0]["testId"]);
      console.log(localStorage.getItem("testId"));

      setTestData({
        round_1: data.round_1 || [],
        round_2: data.round_2 || [],
        round_3: data.round_3 || {},
        round_4: data.round_4 || {},
        turn: data.turn || [],
      });
      setIsDataExisted(true);
    } catch (error) {
      console.error("Error fetching test questions:", error);
      setTestData({
        round_1: [],
        round_2: [],
        round_3: {},
        round_4: {},
        turn: []
      });
    }
  };

  const handleFileUpload = async (question: Question, type: string | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log("file.name.", file.name);
    console.log("fileExtension", fileExtension);
    console.log("question type inside function", type);

    try {
      const key = await uploadFile(file, `Question ${question.questionId}`);
      console.log("question", question);

      const updatedQuestion = { ...question, imgUrl: `https://d1fc7d6en42vzg.cloudfront.net/${key}` };
      console.log("updatedQuestion", updatedQuestion);

      await updateQuestion(updatedQuestion, question.questionId || "");

      const updatedTestData = { ...testData };
      const updateQuestionInList = (questions: Question[]) =>
        questions.map((q) =>
          q.testId === question.testId && q.questionId === question.questionId
            ? updatedQuestion
            : q
        );

      updatedTestData.round_1 = updateQuestionInList(updatedTestData.round_1);
      updatedTestData.round_2 = updateQuestionInList(updatedTestData.round_2);
      for (const packetName in updatedTestData.round_3) {
        updatedTestData.round_3[packetName] = updateQuestionInList(updatedTestData.round_3[packetName]);
      }
      for (const difficulty in updatedTestData.round_4) {
        updatedTestData.round_4[difficulty] = updateQuestionInList(updatedTestData.round_4[difficulty]);
      }
      setTestData(updatedTestData);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  const openModal = (question?: Question, round?: string, groupName?: string) => {
    if (question) {
      setSelectedQuestion(question);
      setEditedQuestion({
        question: question.question,
        answer: question.answer,
        type: question.type || '',
        imgUrl: question.imgUrl || '',
        round: question.round.toString() || '',
        groupName: question.groupName || '',
      });
    } else {
      setSelectedQuestion(null);
      setEditedQuestion({
        question: '',
        answer: '',
        type: '',
        imgUrl: '',
        round: round?.toString() || '',
        groupName: groupName || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question);
    setEditedQuestion({
      question: question.question,
      answer: question.answer,
      type: question.type || '',
      imgUrl: question.imgUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleAddQuestion = (round: string, groupName?: string) => {
    setSelectedQuestion(null);
    setEditedQuestion({ round, groupName });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    if (!selectedQuestion && !editedQuestion.round) return;

    if (selectedQuestion) {
      await updateQuestion(editedQuestion, selectedQuestion.questionId || "");
      const updatedTestData = { ...testData };
      const updateQuestionInList = (questions: Question[]) =>
        questions.map((q) =>
          q.testId === selectedQuestion.testId && q.questionId === selectedQuestion.questionId
            ? { ...q, ...editedQuestion }
            : q
        );

      updatedTestData.round_1 = updateQuestionInList(updatedTestData.round_1);
      updatedTestData.round_2 = updateQuestionInList(updatedTestData.round_2);
      for (const packetName in updatedTestData.round_3) {
        updatedTestData.round_3[packetName] = updateQuestionInList(updatedTestData.round_3[packetName]);
      }
      for (const difficulty in updatedTestData.round_4) {
        updatedTestData.round_4[difficulty] = updateQuestionInList(updatedTestData.round_4[difficulty]);
      }
      setTestData(updatedTestData);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setEditedQuestion({});
  };

  const renderTable = (questions: Question[], title: string, round: string, groupName?: string) => {
    console.log("questions", questions);
    
    if (questions.length === 0 && !groupName) return null;

    return (
      <div className="mb-8">
        {title && (
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <span className="text-cyan-300 mr-2">📝</span>
            {title}
          </h3>
        )}
        {questions.length > 0 && (
          <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-slate-600/50 font-semibold text-blue-200">
              <div>#</div>
              <div>Câu Hỏi</div>
              <div>Đáp Án</div>
              <div>Loại</div>
              <div>Hình Ảnh</div>
              <div>Thao Tác</div>
            </div>
            {questions.map((question, index) => (
              <div key={question.testId + index} className="grid grid-cols-6 gap-4 p-4 border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors">
                <div className="text-blue-200/80">{index + 1}</div>
                <div className="text-white">{question.question}</div>
                <div className="text-white">{question.answer}</div>
                <div className="text-blue-200/80">{question.type || 'N/A'}</div>

                <div className="flex flex-col space-y-2 items-start max-w-full">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 text-sm font-medium"
                    onClick={() => fileInputRefs.current[question.questionId || 0]?.click()}
                  >
                    📤 Tải Lên
                  </button>

                  <span className="text-blue-200/60 break-words max-w-full text-xs">
                    {question.imgUrl ? '✅ Có hình ảnh' : '❌ Chưa có hình ảnh'}
                  </span>

                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[question.questionId || 0] = el;
                    }}
                    className="hidden"
                    onChange={(e) => handleFileUpload(question, question.type, e)}
                  />
                </div>

                <div>
                  <button
                    className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white px-3 py-1 rounded-lg hover:from-yellow-700 hover:to-orange-600 transition-all duration-300 text-sm font-medium"
                    onClick={() => openModal(question)}
                  >
                    ✏️ Sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGroupedTable = (groups: { [key: string]: Question[] }, roundTitle: string, round: string) => {
    if (Object.keys(groups).length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <span className="text-cyan-300 mr-2">🎯</span>
          {roundTitle}
        </h3>
        {Object.entries(groups).map(([groupName, questions]) => (
          <div key={groupName} className="mb-6">
            <h4 className="text-xl font-medium text-blue-200 mb-3 flex items-center">
              <span className="text-yellow-400 mr-2">📦</span>
              {groupName}
            </h4>
            {renderTable(questions, "", round, groupName)}
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'round_1':
        return renderTable(testData.round_1, "NHỔ NEO", "round_1");
      case 'round_2':
        return renderTable(testData.round_2, "VƯỢT SÓNG", "round_2");
      case 'round_3':
        return renderGroupedTable(testData.round_3, "BỨC PHÁ", "round_3");
      case 'round_4':
        return renderGroupedTable(testData.round_4, "CHINH PHỤC", "round_4");
      case 'turn':
        return renderTable(testData.turn, "PHÂN LƯỢT", "round_5");
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Xem Đề Thi</h2>
        <p className="text-blue-200/80">Quản lý và chỉnh sửa các câu hỏi trong đề thi</p>
      </div>

      {/* Test Selection */}
      <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="testSelect" className="block text-blue-200 text-sm font-medium mb-2">
            📋 Chọn Bộ Đề
          </label>
          <select
            id="testSelect"
            name="testSelect"
            className="w-full bg-slate-600/50 border border-blue-400/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
            value={selectedTestName}
            onChange={handleTestChange}
          >
            <option value="" disabled className="bg-slate-700">
              -- Chọn một bộ đề --
            </option>
            {testList.length > 0? 
            testList.map((test) => (
              <option key={test} value={test} className="bg-slate-700">
                {test}
              </option>
            ))
            :
            null
          }
          </select>
        </div>
        <button
          type="button"
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          onClick={handleViewTest}
        >
          👁️ Xem Đề Thi
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-blue-400/30">
          {[
    { label: 'NHỔ NEO', key: 'round_1' },
    { label: 'VƯỢT SÓNG', key: 'round_2' },
    { label: 'BỨC PHÁ', key: 'round_3' },
    { label: 'CHINH PHỤC', key: 'round_4' },
    { label: 'PHÂN LƯỢT', key: 'turn' },
  ].map((tab) => (
            <button
              key={tab.key}
              className={`px-6 py-3 text-white font-medium text-sm transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-b-2 border-cyan-400'
                  : 'bg-slate-700/50 hover:bg-slate-600/50'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {renderTabContent()}
        {testData.round_1.length === 0 &&
          testData.round_2.length === 0 &&
          Object.keys(testData.round_3).length === 0 &&
          Object.keys(testData.round_4).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-blue-200/60 text-lg">Không có câu hỏi nào trong bộ đề này.</p>
            </div>
          )}
      </div>

      {/* Modal for editing/adding */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/30 rounded-xl p-8 shadow-2xl w-full max-w-lg mx-4">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <span className="text-cyan-300 mr-2">
                {selectedQuestion ? '✏️' : '➕'}
              </span>
              {selectedQuestion ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1">Câu Hỏi</label>
                <input
                  type="text"
                  name="question"
                  value={editedQuestion.question || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-blue-400/30 rounded-lg p-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Nhập câu hỏi"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1">Đáp Án</label>
                <input
                  type="text"
                  name="answer"
                  value={editedQuestion.answer || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-blue-400/30 rounded-lg p-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Nhập đáp án"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1">Loại</label>
                <input
                  type="text"
                  name="type"
                  value={editedQuestion.type || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-blue-400/30 rounded-lg p-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Nhập loại câu hỏi"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-1">URL Hình Ảnh</label>
                <input
                  type="text"
                  name="imgUrl"
                  value={editedQuestion.imgUrl || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-blue-400/30 rounded-lg p-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="Nhập URL hình ảnh"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-300"
                onClick={handleConfirm}
              >
                {selectedQuestion ? 'Xác Nhận' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;