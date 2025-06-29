export const processFile = (file:File) => {
    if (!file) {
        throw new Error("Không có file nào được chọn!");
    }

    console.log("file", file);
    

    const formData = new FormData();
    formData.append("file", file);

    console.log("form data", formData);
    

    return formData
}