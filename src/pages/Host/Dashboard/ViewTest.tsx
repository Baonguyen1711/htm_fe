import React, { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { uploadFile } from '../../../shared/hooks/common/uploadAssestServices';
import { Question } from '../../../shared/types';
import { useTestApi } from '../../../shared/hooks/api/useTestApi';
import { Button } from '../../../shared/components/ui';

const ViewTest: React.FC = () => {
  const [testList, setTestList] = useState<string[]>([]);
  const [selectedTestName, setSelectedTestName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [isDataExisted, setIsDataExisted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('round_1');
  const [selectedRound3Group, setSelectedRound3Group] = useState<string>('');
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({}); // Track upload state per question
  const [modifyingQuestions, setModifyingQuestions] = useState<Record<string, boolean>>({}); // Track modification state per question
  const [testData, setTestData] = useState<{
    round_1: Question[];
    round_2: Question[];
    round_3: { [key: string]: Question[] };
    round_4: { [key: string]: Question[] };
    turn: Question[];
    multiplayer: Question[];
  }>({
    round_1: [],
    round_2: [],
    round_3: {},
    round_4: {},
    turn: [],
    multiplayer: [],
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { getTestContent, getTestsNameByUserId, updateQuestion } = useTestApi();

  useEffect(() => {
    const getTestList = async () => {
      try {
        const testList = await getTestsNameByUserId();
        localStorage.setItem('testList', JSON.stringify(testList));
        console.log('test list', testList);
        setTestList(testList);
      } catch (error) {
        console.error('Error fetching test list:', error);
        toast.error('Không thể tải danh sách bộ đề!', {
          position: 'top-right',
          autoClose: 3000,
        });
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
      toast.warn('Vui lòng chọn một bộ đề!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    if (isDataExisted) return;
    try {
      const data = await getTestContent(selectedTestName);
      console.log('data', data);
      if (data['round_1']) {
        setActiveTab('round_1');
        localStorage.setItem('testId', data['round_1'][0]['testId']);
      } else {
        setActiveTab('multiplayer');
        localStorage.setItem('testId', data[0]['testId']);
      }

      console.log(localStorage.getItem('testId'));

      setTestData({
        round_1: data.round_1 || [],
        round_2: data.round_2 || [],
        round_3: data.round_3 || {},
        round_4: data.round_4 || {},
        turn: data.turn || [],
        multiplayer: Array.isArray(data)
  ? data.filter((q: Question) => q.round === "MULTIPLAYER")
  : []
      });
      setIsDataExisted(true);
    } catch (error) {
      console.error('Error fetching test questions:', error);
      toast.error('Không thể tải câu hỏi của bộ đề!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setTestData({
        round_1: [],
        round_2: [],
        round_3: {},
        round_4: {},
        turn: [],
        multiplayer: [],
      });
    }
  };

  const handleFileUpload = async (question: Question, type: string | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const questionId = question.questionId || '';
    if (uploadingQuestions[questionId]) return; // Prevent multiple uploads for this question

    setUploadingQuestions((prev) => ({ ...prev, [questionId]: true }));
    const toastId = toast.info(`Đang tải lên hình ảnh cho câu hỏi ${questionId}...`, {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
    });

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log('file.name.', file.name);
    console.log('fileExtension', fileExtension);
    console.log('question type inside function', type);

    try {
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', "m4a"];
      if (!validExtensions.includes(fileExtension || '')) {
        toast.error('Chỉ hỗ trợ các định dạng hình ảnh: jpg, jpeg, png, gif, mp3, mp4, m4a!', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const key = await uploadFile(file, `Question ${questionId}`);
      console.log('question', question);

      const updatedQuestion = { ...question, imgUrl: `https://d1fc7d6en42vzg.cloudfront.net/${key}` };
      console.log('updatedQuestion', updatedQuestion);

      await updateQuestion(questionId, updatedQuestion);

      const updatedTestData = { ...testData };
      const updateQuestionInList = (questions: Question[]) =>
        questions.map((q) =>
          q.testId === question.testId && q.questionId === questionId ? updatedQuestion : q
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

      toast.dismiss(toastId);
      toast.success('Tải lên hình ảnh thành công!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.dismiss(toastId);
      toast.error('Tải lên hình ảnh thất bại!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setUploadingQuestions((prev) => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
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
    setEditedQuestion((prev: Partial<Question>) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    if (!selectedQuestion && !editedQuestion.round) return;
    if (!editedQuestion.question || !editedQuestion.answer) {
      toast.warn('Vui lòng nhập câu hỏi và đáp án!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const questionId = selectedQuestion?.questionId || '';
    if (modifyingQuestions[questionId]) return; // Prevent multiple submissions

    setModifyingQuestions((prev) => ({ ...prev, [questionId]: true }));
    const toastId = toast.info(`Đang cập nhật câu hỏi ${questionId}...`, {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
    });

    try {
      if (selectedQuestion) {
        await updateQuestion(questionId, editedQuestion);
        const updatedTestData = { ...testData };
        const updateQuestionInList = (questions: Question[]) =>
          questions.map((q) =>
            q.testId === selectedQuestion.testId && q.questionId === questionId
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

        toast.dismiss(toastId);
        toast.success('Cập nhật câu hỏi thành công!', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      setIsModalOpen(false);
      setSelectedQuestion(null);
      setEditedQuestion({});
    } catch (error) {
      console.error('Error updating question:', error);
      toast.dismiss(toastId);
      toast.error('Cập nhật câu hỏi thất bại!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setModifyingQuestions((prev) => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setEditedQuestion({});
  };

  const renderTable = (questions: Question[], title: string, round: string, groupName?: string) => {
    console.log('questions', questions);

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
                  <Button
                    onClick={() => fileInputRefs.current[question.questionId || 0]?.click()}
                    variant="primary"
                    size="sm"
                    className="text-sm font-medium"
                    disabled={uploadingQuestions[question.questionId || '']} // Disable only for this question
                  >
                    {uploadingQuestions[question.questionId || ''] ? 'Đang tải...' : 'Tải Lên'}
                  </Button>

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
                    disabled={uploadingQuestions[question.questionId || '']}
                  />
                </div>

                <div>
                  <Button
                    onClick={() => openModal(question)}
                    variant="warning"
                    size="sm"
                    className="text-sm font-medium"
                    disabled={modifyingQuestions[question.questionId || '']} // Disable only for this question
                  >
                    ✏️ Sửa
                  </Button>
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

    if (round === 'round_3') {
      const groupNames = Object.keys(groups);

      if (!selectedRound3Group && groupNames.length > 0) {
        setSelectedRound3Group(groupNames[0]);
      }

      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <span className="text-cyan-300 mr-2">🎯</span>
            {roundTitle}
          </h3>

          <div className="mb-4">
            <label className="text-blue-200 mr-3">📦 Chọn Chủ Đề:</label>
            <select
              className="bg-slate-600/50 border border-blue-400/30 rounded-lg p-2 text-white"
              value={selectedRound3Group}
              onChange={(e) => setSelectedRound3Group(e.target.value)}
            >
              {groupNames.map((group) => (
                <option key={group} value={group} className="bg-slate-700">
                  {group}
                </option>
              ))}
            </select>
          </div>

          {selectedRound3Group && renderTable(groups[selectedRound3Group], '', round, selectedRound3Group)}
        </div>
      );
    }

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
            {renderTable(questions, '', round, groupName)}
          </div>
        ))}
      </div>
    );
  };

  const renderMultiplayerTable = (questions: Question[]) => {
    console.log('questions', questions);
    if (questions.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-9 gap-4 p-4 bg-slate-600/50 font-semibold text-blue-200">
            <div>#</div>
            <div>Câu Hỏi</div>
            <div>A</div>
            <div>B</div>
            <div>C</div>
            <div>D</div>
            <div>Đáp Án</div>
            <div>Danh mục </div>
            <div>Hình Ảnh</div>
          </div>
          {questions.map((question, index) => (
            <div key={question.questionId} className="grid grid-cols-9 gap-4 p-4 border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors">
              <div className="text-blue-200/80">{index + 1}</div>
              <div className="text-white">{question.question}</div>
              <div className="text-white">{question["answerA"] || "-"}</div>
              <div className="text-white">{question["answerB"] || "-"}</div>
              <div className="text-white">{question["answerC"] || "-"}</div>
              <div className="text-white">{question["answerD"] || "-"}</div>
              <div className="text-cyan-300 font-bold">{question.answer}</div>
              <div className="text-white">{question.catergory.replace("Câu hỏi về", "") || "-"}</div>

              <div className="flex flex-col space-y-2 items-start">
                <Button
                  onClick={() => fileInputRefs.current[question.questionId || ""]?.click()}
                  variant="primary"
                  size="sm"
                  disabled={uploadingQuestions[question.questionId || ""]}
                >
                  {uploadingQuestions[question.questionId || ""] ? "Đang tải..." : "Tải Lên"}
                </Button>
                <span className="text-blue-200/60 text-xs">
                  {question.imgUrl ? "✅ Có file" : "❌ Chưa có file"}
                </span>
                <input
                  type="file"
                  ref={(el) => { fileInputRefs.current[question.questionId || ""] = el; }}
                  className="hidden"
                  onChange={(e) => handleFileUpload(question, question.type, e)}
                  disabled={uploadingQuestions[question.questionId || ""]}
                />
              </div>
              
            </div>
          ))}
        </div>
      </div>
    );
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'round_1':
        return renderTable(testData.round_1, 'NHỔ NEO', 'round_1');
      case 'round_2':
        return renderTable(testData.round_2, 'VƯỢT SÓNG', 'round_2');
      case 'round_3':
        return renderGroupedTable(testData.round_3, 'BỨC PHÁ', 'round_3');
      case 'round_4':
        return renderGroupedTable(testData.round_4, 'CHINH PHỤC', 'round_4');
      case 'turn':
        return renderTable(testData.turn, 'PHÂN LƯỢT', 'round_5');
      case 'multiplayer':
        return renderMultiplayerTable(testData.multiplayer);
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Xem Đề Thi</h2>
        <p className="text-blue-200/80">Quản lý và chỉnh sửa các câu hỏi trong đề thi</p>
      </div>

      <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="testSelect" className="block text-blue-200 text-sm font-medium mb-2">
            Chọn Bộ Đề
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
            {testList.length > 0 ? (
              testList.map((test) => (
                <option key={test} value={test} className="bg-slate-700">
                  {test}
                </option>
              ))
            ) : null}
          </select>
        </div>
        <Button
          type="button"
          onClick={handleViewTest}
          variant="primary"
          size="lg"
          className="font-medium shadow-lg"
        >
          Xem Đề Thi
        </Button>
      </div>
      {
        testData.multiplayer.length == 0 &&
        <div className="mb-8">
          <div className="flex border-b border-blue-400/30">
            {[
              { label: 'NHỔ NEO', key: 'round_1' },
              { label: 'VƯỢT SÓNG', key: 'round_2' },
              { label: 'BỨC PHÁ', key: 'round_3' },
              { label: 'CHINH PHỤC', key: 'round_4' },
              { label: 'PHÂN LƯỢT', key: 'turn' },
              { label: 'MULTIPLAYER', key: 'multiplayer' },
            ].map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? 'primary' : 'secondary'}
                size="md"
                className={`font-medium text-sm transition-all duration-300 ${activeTab === tab.key
                    ? 'border-b-2 border-cyan-400'
                    : 'bg-slate-700/50 hover:bg-slate-600/50'
                  }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      }
      

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
                  disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
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
                  disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
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
                  disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
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
                  disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="md"
                disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirm}
                variant="success"
                size="md"
                disabled={modifyingQuestions[selectedQuestion?.questionId || '']}
              >
                {modifyingQuestions[selectedQuestion?.questionId || ''] ? 'Đang xử lý...' : selectedQuestion ? 'Xác Nhận' : 'Thêm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;