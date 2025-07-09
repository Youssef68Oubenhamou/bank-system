'use client';

import ReportCard from '@/components/ReportCard';
import React, { useState } from 'react';

export default function AIChatForm() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            setResponse(data.result);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: 'Give me a full financial report with total sent, total received, and current balance',
                    context: 'report',
                }),
            });

            const data = await res.json();
            setReport(data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-2">Ask AI</h2>
            <textarea
                className="w-full p-2 border rounded mb-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something..."
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? 'Thinking...' : 'Send'}
            </button>
            <button
                onClick={handleGenerateReport}
                className="mt-4 ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
                Get My Financial Report
            </button>

            {response && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                <strong>Response:</strong>
                <p>{response}</p>
                </div>
            )}

            <ReportCard report={report} />
        </div>
    );
}