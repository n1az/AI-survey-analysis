"use client";
import React from 'react';
import {
  Box,
  Card,
  Flex,
  Text,
  Button,
  Container,
} from '@radix-ui/themes';

const getGlowColor = (sentiment) => {
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment.includes('positive')) return 'var(--green-a8)';
  if (lowerSentiment.includes('negative')) return 'var(--red-a8)';
  if (lowerSentiment.includes('neutral')) return 'var(--blue-a8)';
  return 'var(--gray-a8)'; // default color
};

// Helper function to format the question key
const formatQuestionKey = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

const Analysis = ({ analysisResults, onAnswerAnotherSurvey }) => {
  return (
    <Container size="4" my="8">
      <Flex direction="column" align="center" justify="center">
        <Flex wrap="wrap" justify="center" gap="6" width="100%">
          {Object.entries(analysisResults).map(([questionKey, analysis], index) => {
            const glowColor = getGlowColor(analysis.sentiment);
            return (
              <Card 
                key={index} 
                size="2" 
                style={{ 
                  width: '350px', 
                  maxWidth: '100%',
                  boxShadow: `0 0 15px ${glowColor}`,
                  border: `1px solid ${glowColor}`,
                  transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
                }}
              >
                <Text as="p" size="6" mb="3">{formatQuestionKey(questionKey)}</Text>
                <Text as="p" mb="2"><strong>Summary:</strong> {analysis.summary}</Text>
                <Text as="p" mb="2"><strong>Sentiment:</strong> {analysis.sentiment}</Text>
                <Text as="p" mb="2"><strong>Topic Category:</strong> {analysis.topicCategory}</Text>
                <Text as="p" mb="2"><strong>Action Recommendation:</strong> {analysis.actionRecommendation}</Text>
              </Card>
            );
          })}
        </Flex>
        <Box mt="6">
          <Button variant="surface" onClick={onAnswerAnotherSurvey} size="3">Take the Survey again</Button>
        </Box>
      </Flex>
    </Container>
  );
};

export default Analysis;