"use client";

import { useState, useEffect, useCallback } from 'react';

type ValidateResponse = {
    score: number;
    level: string;
    suggestion: string;
    corrected_sentence: string;
};

export default function Home() {
    const [currentWord, setCurrentWord] = useState<any>(null);
    const [sentence, setSentence] = useState<string>('');
    const [result, setResult] = useState<ValidateResponse | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getRandomWord = useCallback(async () => {
        const response = await fetch("http://localhost:8000/api/word");
        const data = await response.json();

        setCurrentWord(data);
        setSentence('');
        setResult(null);
        setIsSubmitted(false);
        setError(null);
    }, []);

    useEffect(() => {
        getRandomWord();
    }, [getRandomWord]);

    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSentence(e.target.value);
        if (isSubmitted) {
            setResult(null);
            setIsSubmitted(false);
        }
    };

    const handleSubmitSentence = async () => {
        if (!currentWord) return;

        try {
            const res = await fetch("http://localhost:8000/api/validate-sentence", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    word_id: currentWord.id,
                    sentence: sentence,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Request failed: ${res.status}`);
            }

            const data: ValidateResponse = await res.json();
            setResult(data);
            setIsSubmitted(true);

        } catch (error: any) {
            setError(error.message);
        }
    };


    const handleNextWord = () => {
        getRandomWord();
    };


    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Beginner":
                return "bg-green-200 text-green-800";
            case "Intermediate":
                return "bg-yellow-200 text-yellow-800";
            case "Advanced":
                return "bg-red-200 text-red-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };


    if (!currentWord) {
        return <div className="flex justify-center items-center h-screen">Loading…</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">Word Challenge</h1>

            <div className="bg-white p-8 rounded-2xl shadow-xl mb-6 border border-gray-100">

                {/* Word */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-3xl font-bold text-primary">{currentWord.word}</h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentWord.difficulty_level)}`}>
                        {currentWord.difficulty_level}
                    </span>
                </div>

                <p className="text-lg text-gray-700 mb-6">{currentWord.definition}</p>


                {/* Textarea */}
                <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Your Sentence:</label>
                    <textarea
                        className="w-full p-4 border rounded-lg text-lg"
                        rows={4}
                        value={sentence}
                        disabled={isSubmitted}
                        onChange={handleSentenceChange}
                    ></textarea>
                </div>


                {/* Submit / Next */}
                <div className="flex justify-between items-center">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmitSentence}
                            className="px-6 py-3 bg-primary text-white rounded-lg"
                            disabled={!sentence.trim()}
                        >
                            Submit Sentence
                        </button>
                    ) : (
                        <button
                            onClick={handleNextWord}
                            className="px-6 py-3 bg-info text-white rounded-lg"
                        >
                            Next Word
                        </button>
                    )}
                </div>


                {/* Error */}
                {error && (
                    <p className="text-red-600 mt-4">Error: {error}</p>
                )}

                {/* Result from backend */}
                {result && (
                    <div className="mt-6 border p-4 rounded-lg shadow-sm bg-gray-50">
                        <h3 className="text-xl font-bold mb-2">Result</h3>
                        <p><strong>Score:</strong> {result.score}</p>
                        <p><strong>Level:</strong> {result.level}</p>
                        <p><strong>Suggestion:</strong> {result.suggestion}</p>
                        <p><strong>Corrected Sentence:</strong> {result.corrected_sentence}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
