import React, { useEffect, useState } from 'react';
import { getTest, getTestByUserId, updateQuestion } from './service';
import { Question } from '../../../type';
import useAuth from '../../../hooks/useAuth';
import { useQuery } from 'react-query';

interface AuthToken {
  getToken: () => Promise<string | null>;
}

const ViewTest: React.FC<AuthToken> = ({getToken}) => {
  const [testList, setTestList] = useState<string[]>([]);
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [isDataExisted, setIsDatExisted] = useState<boolean>(false)
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


  // Fetch the list of tests on component mount
  useEffect(() => {
    const getTestList = async () => {
      try {
        const testList = await getTestByUserId();
        localStorage.setItem("testList", JSON.stringify(testList))
        setTestList(testList);
      } catch (error) {
        console.error("Error fetching test list:", error);
      }
    };

    getTestList();
  }, []);

  // useEffect(()=> {
  //   const {data, isLoading, error } = useQuery<{
  //     round_1: Question[];
  //     round_2: Question[];
  //     round_3: { [key: string]: Question[] };
  //     round_4: { [key: string]: Question[] };
  //   } | undefined>('testData', () => getTest(selectedTestName), {
  //     staleTime: 300000, // Cache data for 5 minutes
  //   });
  //   if(data){
  //     setTestData(data)
  //     setIsDatExisted(true)
  //     return
  //   }
  // })

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(event.target.value);
  };

  
 
  const handleViewTest = async () => {
    
    if (!selectedTestName) {
      alert("Please select a test first!");
      return;
    }

    if(isDataExisted) {
      return
    }

    try {

      console.log("abc")
      const data = await getTest(selectedTestName);
      console.log("data", data)
      setTestData({
        round_1: data.round_1 || [],
        round_2: data.round_2 || [],
        round_3: data.round_3 || {},
        round_4: data.round_4 || {},
      });
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

  // Open modal with the selected question
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

  // Handle input changes in the modal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedQuestion((prev) => ({ ...prev, [name]: value }));
  };


  const handleConfirm = async () => {
    if (!selectedQuestion) return;

    await updateQuestion(editedQuestion, selectedQuestion.questionId || "");
    // Update the question in testData
    const updatedTestData = { ...testData };

    // Helper to update a question in a list
    const updateQuestionInList = (questions: Question[]) => {
      return questions.map((q) =>
        q.testId === selectedQuestion.testId && q.questionId === selectedQuestion.questionId
          ? { ...q, ...editedQuestion }
          : q
      );
    };

    updatedTestData.round_1 = updateQuestionInList(updatedTestData.round_1);

    updatedTestData.round_2 = updateQuestionInList(updatedTestData.round_2);

    for (const packetName in updatedTestData.round_3) {
      updatedTestData.round_3[packetName] = updateQuestionInList(updatedTestData.round_3[packetName]);
    }

    for (const difficulty in updatedTestData.round_4) {
      updatedTestData.round_4[difficulty] = updateQuestionInList(updatedTestData.round_4[difficulty]);
    }

    setTestData(updatedTestData);
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setEditedQuestion({});
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setEditedQuestion({});
  };

  // Render table for a list of questions
  const renderTable = (questions: Question[], title: string) => {
    if (questions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Question</th>
              <th className="border p-2">Answer</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Url</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question.testId + index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{question.question}</td>
                <td className="border p-2">{question.answer}</td>
                <td className="border p-2">{question.type || 'N/A'}</td>
                <td className="border p-2">{question.imgUrl || 'N/A'}</td>
                <td className="border p-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleEditClick(question)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render grouped tables for round_3 and round_4
  const renderGroupedTable = (groups: { [key: string]: Question[] }, roundTitle: string) => {
    if (Object.keys(groups).length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{roundTitle}</h3>
        {Object.entries(groups).map(([groupName, questions]) => (
          <div key={groupName} className="mb-4">
            <h4 className="text-lg font-medium mb-2">{groupName}</h4>
            {renderTable(questions, "")}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card p-6 shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Uploaded Exams</h2>
      <label className="block text-lg mb-2" htmlFor="testSelect">
        Chọn bộ đề
      </label>

      <select
        id="testSelect"
        name="testSelect"
        className="border rounded p-2 w-full mb-4"
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

      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
        onClick={handleViewTest}
      >
        View
      </button>

      {/* Hiển thị bảng cho từng vòng */}
      {renderTable(testData.round_1, "Round 1")}
      {renderTable(testData.round_2, "Round 2")}
      {renderGroupedTable(testData.round_3, "Round 3")}
      {renderGroupedTable(testData.round_4, "Round 4")}

      {testData.round_1.length === 0 &&
        testData.round_2.length === 0 &&
        Object.keys(testData.round_3).length === 0 &&
        Object.keys(testData.round_4).length === 0 && (
          <p className="text-gray-500">No questions available for this test.</p>
        )}

      {/* Modal for editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Question</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Question</label>
              <input
                type="text"
                name="question"
                value={editedQuestion.question || ''}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Answer</label>
              <input
                type="text"
                name="answer"
                value={editedQuestion.answer || ''}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type</label>
              <input
                type="text"
                name="type"
                value={editedQuestion.type || ''}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                name="imgUrl"
                value={editedQuestion.imgUrl || ''}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;