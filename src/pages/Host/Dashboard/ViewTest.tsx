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
  const [activeTab, setActiveTab] = useState<string>('round_1');
  const [selectedRound3Group, setSelectedRound3Group] = useState<string>('');
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<string, boolean>>({});
  const [modifyingQuestions, setModifyingQuestions] = useState<Record<string, boolean>>({});
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

  const TABS = [
    { key: 'round_1', label: 'NHỔ NEO' },
    { key: 'round_2', label: 'VƯỢT SÓNG' },
    { key: 'round_3', label: 'BỨC PHÁ' },
    { key: 'round_4', label: 'CHINH PHỤC' },
    { key: 'turn', label: 'PHÂN LƯỢT' },
    { key: 'multiplayer', label: 'MULTIPLAYER' },
  ];

  useEffect(() => {
    const loadTests = async () => {
      try {
        const tests = await getTestsNameByUserId();
        localStorage.setItem('testList', JSON.stringify(tests));
        setTestList(tests);
      } catch (err) {
        toast.error('Không thể tải danh sách bộ đề!');
      }
    };
    loadTests();
  }, []);

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(e.target.value);
  };

  const handleViewTest = async () => {
    if (!selectedTestName) return toast.warn('Vui lòng chọn bộ đề!');
    try {
      const data = await getTestContent(selectedTestName);
      const hasRound1 = data.round_1 && data.round_1.length > 0;
      setActiveTab(hasRound1 ? 'round_1' : 'multiplayer');

      setTestData({
        round_1: data.round_1 || [],
        round_2: data.round_2 || [],
        round_3: data.round_3 || {},
        round_4: data.round_4 || {},
        turn: data.turn || [],
        multiplayer: Array.isArray(data)
          ? data.filter((q: Question) => q.round === "MULTIPLAYER")
          : [],
      });
    } catch (err) {
      toast.error('Không thể tải câu hỏi!');
      setTestData({ round_1: [], round_2: [], round_3: {}, round_4: {}, turn: [], multiplayer: [] });
    }
  };

  const handleFileUpload = async (question: Question, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const qid = question.questionId || '';
    if (uploadingQuestions[qid]) return;

    setUploadingQuestions(prev => ({ ...prev, [qid]: true }));
    const toastId = toast.info(`Đang tải lên cho câu ${qid}...`, { autoClose: false });

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const valid = ['jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'm4a'];
      if (!ext || !valid.includes(ext)) {
        throw new Error('Định dạng không hỗ trợ');
      }

      const key = await uploadFile(file, `Question ${qid}`);
      const imgUrl = `https://d1fc7d6en42vzg.cloudfront.net/${key}`;
      const updated = { ...question, imgUrl };

      await updateQuestion(qid, updated);
      updateTestDataWithQuestion(updated);

      toast.dismiss(toastId);
      toast.success('Tải lên thành công!');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Tải lên thất bại!');
    } finally {
      setUploadingQuestions(prev => {
        const n = { ...prev };
        delete n[qid];
        return n;
      });
    }
  };

  const updateTestDataWithQuestion = (updatedQuestion: Question) => {
    setTestData(prev => {
      const updateInArray = (arr: Question[]) =>
        arr.map(q => q.questionId === updatedQuestion.questionId ? updatedQuestion : q);

      return {
        ...prev,
        round_1: updateInArray(prev.round_1),
        round_2: updateInArray(prev.round_2),
        round_3: Object.fromEntries(
          Object.entries(prev.round_3).map(([k, v]) => [k, updateInArray(v)])
        ),
        round_4: Object.fromEntries(
          Object.entries(prev.round_4).map(([k, v]) => [k, updateInArray(v)])
        ),
        multiplayer: updateInArray(prev.multiplayer),
      };
    });
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setEditedQuestion({
      question: question.question,
      answer: question.answer,
      type: question.type || '',
      imgUrl: question.imgUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuestion) return;
    const qid = selectedQuestion.questionId || '';
    if (modifyingQuestions[qid]) return;

    setModifyingQuestions(prev => ({ ...prev, [qid]: true }));
    const toastId = toast.info('Đang cập nhật...', { autoClose: false });

    try {
      await updateQuestion(qid, editedQuestion);
      const updated = { ...selectedQuestion, ...editedQuestion };
      updateTestDataWithQuestion(updated);

      toast.dismiss(toastId);
      toast.success('Cập nhật thành công!');
      setIsModalOpen(false);
      setSelectedQuestion(null);
      setEditedQuestion({});
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Cập nhật thất bại!');
    } finally {
      setModifyingQuestions(prev => {
        const n = { ...prev };
        delete n[qid];
        return n;
      });
    }
  };

  const renderQuestionsTable = (questions: Question[], showIndex = true) => {
    if (questions.length === 0) return null;

    return (
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-5 bg-slate-700/40 font-medium  text-sm">
          {showIndex && <div>#</div>}
          <div className={showIndex ? "col-span-4" : "col-span-5"}>Câu hỏi</div>
          <div className="col-span-2">Đáp án</div>
          <div className="col-span-1">Loại</div>
          <div className="col-span-2">Hình ảnh</div>
          <div className="col-span-2">Thao tác</div>
        </div>
        {questions.map((q, i) => (
          <div key={q.questionId} className="grid grid-cols-12 gap-4 p-5 border-t border-cyan-700/20 hover:bg-slate-700/30 transition-colors">
            {showIndex && <div className="">{i + 1}</div>}
            <div className={showIndex ? "col-span-4" : "col-span-5"}>{q.question}</div>
            <div className="col-span-2 text-white">{q.answer}</div>
            <div className="col-span-1 ">{q.type || '-'}</div>
            <div className="col-span-2">
              <Button
                onClick={() => fileInputRefs.current[q.questionId || '']?.click()}
                variant="primary"
                size="sm"
                className="h-10 text-sm"
                disabled={!!uploadingQuestions[q.questionId || '']}
              >
                {uploadingQuestions[q.questionId || ''] ? 'Đang tải...' : 'Tải lên'}
              </Button>
              <p className="text-xs text-cyan-400 mt-1">
                {q.imgUrl ? '✅ Có file' : '❌ Chưa có'}
              </p>
              <input
                type="file"
                ref={el => { fileInputRefs.current[q.questionId || ''] = el; }}
                className="hidden"
                onChange={e => handleFileUpload(q, e)}
              />
            </div>
            <div className="col-span-2">
              <Button
                onClick={() => handleEdit(q)}
                variant="warning"
                size="sm"
                className="h-10 text-sm"
              >
                Sửa
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMultiplayerTable = (questions: Question[]) => {
    if (questions.length === 0) return null;

    return (
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-10 gap-4 p-5 bg-slate-700/40 font-medium  text-sm">
          <div>#</div>
          <div className="col-span-3">Câu hỏi</div>
          <div>A</div>
          <div>B</div>
          <div>C</div>
          <div>D</div>
          <div>Đáp án</div>
          <div>Hình ảnh</div>
          <div>Thao tác</div>
        </div>
        {questions.map((q, i) => (
          <div key={q.questionId} className="grid grid-cols-10 gap-4 p-5 border-t border-cyan-700/20 hover:bg-slate-700/30">
            <div className="">{i + 1}</div>
            <div className="col-span-3 text-white">{q.question}</div>
            <div>{q.answerA || '-'}</div>
            <div>{q.answerB || '-'}</div>
            <div>{q.answerC || '-'}</div>
            <div>{q.answerD || '-'}</div>
            <div className="text-green-400 font-bold">{q.answer}</div>
            <div>
              <Button
                onClick={() => fileInputRefs.current[q.questionId || '']?.click()}
                variant="primary"
                size="sm"
                className="h-10 text-sm"
                disabled={!!uploadingQuestions[q.questionId || '']}
              >
                {uploadingQuestions[q.questionId || ''] ? 'Đang tải...' : 'Tải lên'}
              </Button>
              <p className="text-xs text-cyan-400 mt-1">
                {q.imgUrl ? '✅ Có' : '❌ Chưa'}
              </p>
              <input
                type="file"
                ref={el => { fileInputRefs.current[q.questionId || ''] = el; }}
                className="hidden"
                onChange={e => handleFileUpload(q, e)}
              />
            </div>
            <div>
              <Button onClick={() => handleEdit(q)} variant="warning" size="sm" className="h-10 text-sm">
                Sửa
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'round_1': return renderQuestionsTable(testData.round_1);
      case 'round_2': return renderQuestionsTable(testData.round_2);
      case 'round_3':
        const groups = testData.round_3;
        const groupNames = Object.keys(groups);
        if (groupNames.length === 0) return null;
        if (!selectedRound3Group) setSelectedRound3Group(groupNames[0]);
        return (
          <div>
            <select
              value={selectedRound3Group}
              onChange={e => setSelectedRound3Group(e.target.value)}
              className="mb-6 px-5 py-3 bg-slate-700/60 border border-cyan-500/50 rounded-xl text-white"
            >
              {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {selectedRound3Group && renderQuestionsTable(groups[selectedRound3Group])}
          </div>
        );
      case 'round_4':
        return Object.entries(testData.round_4).map(([level, qs]) => (
          <div key={level} className="mb-10">
            <h4 className="text-xl font-semibold  mb-4 capitalize">{level}</h4>
            {renderQuestionsTable(qs)}
          </div>
        ));
      case 'turn': return renderQuestionsTable(testData.turn);
      case 'multiplayer': return renderMultiplayerTable(testData.multiplayer);
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer theme="dark" />

      {/* ===== CARD: SELECT TEST ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm ">Quản lý câu hỏi trong bộ đề</p>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="text-sm  mb-2 block">Chọn bộ đề</label>
              <select
                value={selectedTestName}
                onChange={e => setSelectedTestName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white"
              >
                <option value="">-- Chọn bộ đề --</option>
                {testList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleViewTest} className="bg-slate-700/50 hover:bg-slate-700 h-11 px-6">
              Xem đề
            </Button>
          </div>
        </div>
      </div>

      {/* ===== CARD: TABS ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap gap-3">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700/50  hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CARD: CONTENT ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        {renderContent()}
      </div>

      {/* ===== MODAL EDIT – GIỮ NGUYÊN LOGIC ===== */}
      {isModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800/90 border border-cyan-500/40 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-white mb-4 text-center">Sửa câu hỏi</h3>

            <div className="space-y-4">
              {['question', 'answer', 'type', 'imgUrl'].map(key => (
                <input
                  key={key}
                  value={(editedQuestion as any)[key] || ''}
                  onChange={e => setEditedQuestion(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white"
                  placeholder={key}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button variant="success">Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;