"use client";
import React, { useState, useCallback } from 'react';
import Survey from './survey';
import Analysis from './analysis';

const SurveyManager = () => {
  const [showSurvey, setShowSurvey] = useState(true);
  const [analysisResults, setAnalysisResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSurveySubmit = useCallback(async (openEndedResponses) => {
    setIsLoading(true);
    try {
      const prompt = `Analyze this data: ${JSON.stringify(openEndedResponses)}
      
      For each open-ended response, provide the following analysis:
      1. Summary: A short summary of the answer.
      2. Sentiment analysis: "Positive", "Neutral" or "Negative"
      3. Topic Category: Categorize the open-ended answer into a main topic. e.g. "Work Environment complaints"
      4. Action recommendation: One-sentence suggestion to solve the problem mentioned or improve the situation/effect in the answer.

      Format your response as follows for each question:
      [Question Key]
      Summary: [Summary]
      Sentiment analysis: [Sentiment]
      Topic Category: [Category]
      Action recommendation: [Recommendation]

      Ensure there's a blank line between each question's analysis.`;

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

  const parseAnalysisResults = (text) => {
    const results = {};
    const questionBlocks = text.split(/\[([^\]]+)\]/).filter(Boolean);

    for (let i = 0; i < questionBlocks.length; i += 2) {
      const questionKey = questionBlocks[i].trim();
      const analysisText = questionBlocks[i + 1]?.trim();

      if (analysisText) {
        const lines = analysisText.split('\n');
        results[questionKey] = {
          summary: lines.find(l => l.startsWith('Summary:'))?.replace('Summary:', '').trim() || '',
          sentiment: lines.find(l => l.startsWith('Sentiment analysis:'))?.replace('Sentiment analysis:', '').trim() || '',
          topicCategory: lines.find(l => l.startsWith('Topic Category:'))?.replace('Topic Category:', '').trim() || '',
          actionRecommendation: lines.find(l => l.startsWith('Action recommendation:'))?.replace('Action recommendation:', '').trim() || '',
        };
      }
    }
    console.log(results)
    return results;
  };

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