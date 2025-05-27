import React, { useEffect, useState, useRef } from 'react';
import { getTest, getTestByUserId, updateQuestion, addNewQuestion } from './service';
import { uploadFile } from '../../../services/uploadAssestServices';
import { Question } from '../../../type';
import { useQuery } from 'react-query';


const ViewTest: React.FC = () => {
  const [testList, setTestList] = useState<string[]>([]);
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [isDataExisted, setIsDataExisted] = useState<boolean>(false);
  const [testData, setTestData] = useState<{
    round_1: Question[];
    round_2: Question[];
    round_3: { [key: string]: Question[] };
    round_4: { [key: string]: Question[] };
  }>({
    round_1: [],
    round_2: [],
    round_3: {},
    round_4: {},
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Fetch test list on mount
  useEffect(() => {
    const getTestList = async () => {
      try {
        const testList = await getTestByUserId();
        localStorage.setItem("testList", JSON.stringify(testList));
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
      const data = await getTest(selectedTestName);
      console.log("data",data);
      localStorage.setItem("testId", data["round_1"][0]["testId"])
      console.log(localStorage.getItem("testId"));
      
      
      setTestData({
        round_1: data.round_1 || [],
        round_2: data.round_2 || [],
        round_3: data.round_3 || {},
        round_4: data.round_4 || {},
      });
      setIsDataExisted(true);
    } catch (error) {
      console.error("Error fetching test questions:", error);
      setTestData({
        round_1: [],
        round_2: [],
        round_3: {},
        round_4: {},
      });
    }
  };

  // Handle file upload to S3
  const handleFileUpload = async (question: Question, type: string | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type against question type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log("file.name.", file.name);

    console.log("fileExtension", fileExtension);

    console.log("question type inside function", type);

    // const allowedExtensions = question.type?.toLowerCase().split(',') || [];
    // if (!allowedExtensions.includes(fileExtension || '')) {
    //   alert(`File type must be one of: ${allowedExtensions.join(', ')}`);
    //   return;
    // }

    try {
      const key = await uploadFile(file, `Question ${question.questionId}`);
      console.log("question", question);

      const updatedQuestion = { ...question, imgUrl: `https://d1fc7d6en42vzg.cloudfront.net/${key}` };
      console.log("updatedQuestion", updatedQuestion);

      await updateQuestion(updatedQuestion, question.questionId || "");

      // Update testData
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
      // Edit mode - load selected question data
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
      // Add mode - start fresh, optionally with round/groupName info
      setSelectedQuestion(null);
      setEditedQuestion({
        question: '',
        answer: '',
        type: '',
        imgUrl: '',
        round: round?.toString()  || '',
        groupName: groupName || '',
      });
    }
    setIsModalOpen(true);
  };


  // Open modal for editing question
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

  // Open modal for adding new question
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
      // Update existing question
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

  // Render table for questions
  const renderTable = (questions: Question[], title: string, round: string, groupName?: string) => {
    if (questions.length === 0 && !groupName) return null;

    return (
      <div className="mb-8">
        {title && <h3 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h3>}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-semibold text-gray-700">
              <div>#</div>
              <div>Question</div>
              <div>Answer</div>
              <div>Type</div>
              <div>URL</div>
              <div>Action</div>
            </div>
            {questions.map((question, index) => {
              return (

                <div key={question.testId + index} className="grid grid-cols-6 gap-4 p-4 border-t hover:bg-gray-50">
                  <div className="text-gray-600">{index + 1}</div>
                  <div className="text-gray-800">{question.question}</div>
                  <div className="text-gray-800">{question.answer}</div>
                  <div className="text-gray-600">{question.type || 'N/A'}</div>

                  <div className="flex flex-col space-y-2 items-start max-w-full">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                      onClick={() => fileInputRefs.current[question.questionId || 0]?.click()}
                    >
                      Upload
                    </button>

                    <span className="text-gray-600 break-words max-w-full">{question.imgUrl || 'N/A'}</span>

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
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                      onClick={() => openModal(question)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )

            })}
          </div>
        )}
        {/* <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={() => openModal(undefined,round, groupName)}
        >
          Add New Question
        </button> */}
      </div>
    );
  };

  // Render grouped tables for round_3 and round_4
  const renderGroupedTable = (groups: { [key: string]: Question[] }, roundTitle: string, round: string) => {
    if (Object.keys(groups).length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{roundTitle}</h3>
        {Object.entries(groups).map(([groupName, questions]) => (
          <div key={groupName} className="mb-6">
            <h4 className="text-xl font-medium text-gray-700 mb-3">{groupName}</h4>
            {renderTable(questions, "", round, groupName)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Uploaded Exams</h2>
        <div className="mb-6">
          <label htmlFor="testSelect" className="block text-lg font-medium text-gray-700 mb-2">
            Select Test
          </label>
          <select
            id="testSelect"
            name="testSelect"
            className="border border-gray-300 rounded-lg p-3 w-full bg-white focus:ring-2 focus:ring-blue-500 transition"
            value={selectedTestName}
            onChange={handleTestChange}
          >
            <option value="" disabled>
              -- Select a Test --
            </option>
            {testList.map((test) => (
              <option key={test} value={test}>
                {test}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-8"
          onClick={handleViewTest}
        >
          View Test
        </button>

        {/* Render rounds */}
        {renderTable(testData.round_1, "Round 1", "round_1")}
        {renderTable(testData.round_2, "Round 2", "round_2")}
        {renderGroupedTable(testData.round_3, "Round 3", "round_3")}
        {renderGroupedTable(testData.round_4, "Round 4", "round_4")}

        {testData.round_1.length === 0 &&
          testData.round_2.length === 0 &&
          Object.keys(testData.round_3).length === 0 &&
          Object.keys(testData.round_4).length === 0 && (
            <p className="text-gray-500 text-center">No questions available for this test.</p>
          )}

        {/* Modal for editing/adding */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                {selectedQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={editedQuestion.question || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <input
                    type="text"
                    name="answer"
                    value={editedQuestion.answer || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={editedQuestion.type || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="imgUrl"
                    value={editedQuestion.imgUrl || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                  onClick={handleConfirm}
                >
                  {selectedQuestion ? 'Confirm' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTest;