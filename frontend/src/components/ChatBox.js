import React, { useState } from 'react';
import axios from 'axios';
import '../ChatBox.css';
import { BACKEND_URL } from '../utils/index'

// const BACKEND_URL = process.env.BACKEND_URL

const ChatBox = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);  // New loading state

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleAskQuestion = async () => {
        setLoading(true);  // Set loading to true when the request starts
        const formData = new FormData();
        formData.append('question', question);

        try {
            const res = await axios.post(`${BACKEND_URL}/api/chatbot/ask_question/`, formData);
            setResponse(res.data.answer);
        } catch (error) {
            setResponse("Error retrieving the response. Please try again.");
        } finally {
            setLoading(false);  // Set loading to false when the request completes
        }
    };

    return (
        <div className="chat-box">
            <input
                type="text"
                placeholder="Ask a Question"
                value={question}
                onChange={handleQuestionChange}
                className="chat-input"
            />
            <button onClick={handleAskQuestion} className="ask-button">Ask</button>
            <div className="response-box">
                {loading ? (
                    <div className="spinner"></div>  // Display spinner while loading
                ) : (
                    response && <p className="bot-response">Reply: {response}</p>
                )}
            </div>
        </div>
    );
};

export default ChatBox;

