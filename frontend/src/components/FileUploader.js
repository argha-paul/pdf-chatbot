import React, { useState } from 'react';
import axios from 'axios';
import '../FileUploader.css';
import { BACKEND_URL } from '../utils/index'

// const BACKEND_URL = process.env.BACKEND_URL

const FileUploader = ({ onUploadComplete }) => {
    const [files, setFiles] = useState(null);
    const [loading, setLoading] = useState(false);  // New loading state

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleUpload = async () => {
        setLoading(true); 
        const formData = new FormData();
        for (let file of files) {
            formData.append('pdf_files', file);
        }
        // console.log(BACKEND_URL)
        await axios.post(`${BACKEND_URL}/api/chatbot/process_pdf/`, formData);
        onUploadComplete();
        setLoading(false);
    };

    return (
        <div className="file-uploader">
            <input type="file" multiple onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} className="upload-button">{loading ? (
                    <div className="spinner2"></div>  // Display spinner while loading
                ) : (
                    <div>Submit & Process</div>
                )}</button>
        </div>
    );
};

export default FileUploader;
