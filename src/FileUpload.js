import React, { useRef, useState } from "react";

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null); // To display file name after selection

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : null); // Update the file name
  };

  const handleUpload = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target.result);
        const slicedData = json.slice(0, 300);
        onFileUpload(slicedData);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        width: "100%",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <label style={{ fontWeight: "bold", marginBottom: "10px", display: "block" }}>
        Upload a JSON File
      </label>
      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div style={{ marginBottom: "10px" }}>
        <button
          style={{
            backgroundColor: "#e0e0e0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "5px 10px",
            marginRight: "10px",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current.click()}
        >
          Choose File
        </button>
        {fileName && <span>{fileName}</span>}
      </div>
      <button
        style={{
          backgroundColor: "#e0e0e0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "5px 15px",
          cursor: "pointer",
        }}
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
