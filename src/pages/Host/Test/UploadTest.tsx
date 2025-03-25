import React from "react";
import { uploadTestToServer } from "./service";


const UploadExam:React.FC = () => {

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Ngăn chặn form reload trang

        // Lấy file từ input
        const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
        const testNameInput = document.getElementById("testName") as HTMLInputElement
        const file = fileInput.files?.[0]; // Lấy file đầu tiên

        if (!file) {
            alert("Vui lòng chọn một file!");
            return;
        }

        // Gọi hàm upload file
        uploadTestToServer(file, testNameInput.value)
            .then((response) => {
                console.log("Upload thành công:", response);
            })
            .catch((error) => {
                console.error("Lỗi khi upload file:", error);
            });
    };

    return (
        <div className="card p-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Upload Exam File</h2>
            <form method="POST" encType="multipart/form-data" onSubmit={(event) => handleFormSubmit(event)}>
                <div className="mb-4">
                    <label className="block text-lg mb-2" htmlFor="fileUpload">
                        Upload Excel File
                    </label>
                    <input
                        type="file"
                        id="fileUpload"
                        name="excelFile"
                        accept=".xlsx"
                        className="border rounded p-2 w-full"
                        required
                    />
                    
                    <label className="block text-lg mb-2" htmlFor="fileUpload">
                        Nhập tên bộ đề
                    </label>

                    <input
                        id="testName"
                        name="testName"
                        className="border rounded p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <a href="/example-template" className="text-blue-500">
                        Download Example Template
                    </a>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Upload
                </button>
            </form>
        </div>
    );
}

export default UploadExam
