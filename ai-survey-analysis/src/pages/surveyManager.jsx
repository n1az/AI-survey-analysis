"use client";
import React, { useState, useCallback } from 'react';
import Survey from './survey';
import Analysis from './analysis';

const SurveyManager = () => {
  // State to control whether to show the survey or analysis
  const [showSurvey, setShowSurvey] = useState(true);
  // State to store the analysis results
  const [analysisResults, setAnalysisResults] = useState({});
  // State to manage loading state during form submission
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the survey submission and processes the response
   * @param {Object} openEndedResponses - The survey responses
   */
  const handleSurveySubmit = useCallback(async (openEndedResponses) => {
    setIsLoading(true);
    try {
      const prompt = `Analyze this data: ${JSON.stringify(openEndedResponses)}`;

      // Send survey data to API for analysis
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      // Read and process the streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
      }

      const parsedResults = parseAnalysisResults(fullResponse);
      setAnalysisResults(parsedResults);
      setShowSurvey(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Parses the analysis results from the API response
   * @param {string} text - The raw text response from the API
   * @returns {Object} The parsed analysis results
   */
  const parseAnalysisResults = (text) => {
    const results = {};
    const questionBlocks = text.split(/\[([^\]]+)\]/).filter(Boolean);

    for (let i = 0; i < questionBlocks.length; i += 2) {
      const questionKey = questionBlocks[i].trim();
      const analysisText = questionBlocks[i + 1]?.trim();

      if (analysisText) {
        const lines = analysisText.split('\n');
        results[questionKey] = {
          question: lines.find(l => l.startsWith('Question:'))?.replace('Question:', '').trim() || '',
          summary: lines.find(l => l.startsWith('Summary:'))?.replace('Summary:', '').trim() || '',
          sentiment: lines.find(l => l.startsWith('Sentiment analysis:'))?.replace('Sentiment analysis:', '').trim() || '',
          topicCategory: lines.find(l => l.startsWith('Topic Category:'))?.replace('Topic Category:', '').trim() || '',
          actionRecommendation: lines.find(l => l.startsWith('Action recommendation:'))?.replace('Action recommendation:', '').trim() || '',
        };
      }
    }
    return results;
  };

  /**
   * Resets the component state to allow answering another survey
   */
  const handleAnswerAnotherSurvey = useCallback(() => {
    setShowSurvey(true);
    setAnalysisResults({});
  }, []);

  return (
    <div>
      {showSurvey ? (
        <Survey onSubmitSuccess={handleSurveySubmit} isLoading={isLoading} />
      ) : (
        <Analysis 
          analysisResults={analysisResults} 
          onAnswerAnotherSurvey={handleAnswerAnotherSurvey} 
        />
      )}
    </div>
  );
};

export default SurveyManager;