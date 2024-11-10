import './App.css';
import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import ChatBox from './components/ChatBox';

function App() {
  const [isProcessed, setIsProcessed] = useState(false);

  return (
    <div className="Hero">
        <div className="app-container">
            <video autoPlay loop muted className="background-video">
                <source src="https://cdn.prod.website-files.com/66d0f81efbf7984b14461c32%2F66f55df828dd432549c6e583_prem_footer-transcode.mp4" type="video/mp4" />
            </video>
                <div className="app-header">
                    <h1>Chat with multiple PDFs</h1>
                </div>

                <div className="app-content">
                    {!isProcessed ? (
                    <FileUploader onUploadComplete={() => setIsProcessed(true)} />
                    ) : (
                    <ChatBox />
                )}
                </div>
        </div>
    </div>
    
  );
}

export default App;