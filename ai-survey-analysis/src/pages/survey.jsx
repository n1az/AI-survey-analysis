"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Slider,
  Select,
  TextArea,
  Button,
  Card,
  Container,
  RadioGroup,
  Separator,
  Spinner
} from '@radix-ui/themes';
import surveyData from '../data/survey.json';

const Survey = ({ onSubmitSuccess, isLoading }) => {

  const [formData, setFormData] = useState({});
  const [openEndedResponses, setOpenEndedResponses] = useState({});
  const [pageIndex, setPageIndex] = useState(0);


  const extractOpenEndedResponses = useCallback(() => {
    const openEnded = {};
    surveyData.pages.forEach(page => {
      page.elements.forEach(element => {
        if (element.type === 'text') {
          const response = formData[page.name]?.[element.name];
          openEnded[`${element.name}`] = {
            question: element.title,
            answer: response && response.trim() !== '' ? response : "Not Provided by user"
          };
        }
      });
    });
    return openEnded;
  }, [formData]);

  useEffect(() => {
    setOpenEndedResponses(extractOpenEndedResponses());
  }, [extractOpenEndedResponses]);

  const handleInputChange = useCallback((page, element, value) => {
    setFormData(prevData => ({
      ...prevData,
      [page]: {
        ...prevData[page],
        [element]: value
      }
    }));
  }, []);

  const handleNext = useCallback(() => {
    setPageIndex(prev => Math.min(prev + 1, surveyData.pages.length - 1));
  }, []);

  const handlePrevious = useCallback(() => {
    setPageIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    const responses = extractOpenEndedResponses();
    if (typeof onSubmitSuccess === 'function') {
      onSubmitSuccess(responses);
    }
  }, [extractOpenEndedResponses, onSubmitSuccess]);

  const renderElement = (element) => {
    const elementId = `${surveyData.pages[pageIndex].name}_${element.name}`;
    
    switch (element.type) {
      case 'rating':
        return (
          <Box key={element.name}>
            <Text size="3" mb="1" htmlFor={elementId}>{element.title}</Text>
            <Box mt="3">
              <Slider 
                defaultValue={[formData[surveyData.pages[pageIndex].name]?.[element.name] || 0]}
                min={element.rateMin}
                max={element.rateMax}
                step={1}
                id={elementId}
                name={elementId}
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value[0])}
              />
            </Box>
          </Box>
        );
      case 'dropdown':
        return (
          <Box key={element.name}>
            <Text size="3" mb="1" htmlFor={elementId}>{element.title}</Text>
            <Box mt="2">
              <Select.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value)}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name] || ''}
              >
                <Select.Trigger id={elementId} name={elementId} placeholder="Please Select" />
                <Select.Content>
                  {element.choices.map((choice, index) => (
                    <Select.Item key={index} value={choice}>{choice}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Box>
        );
      case 'boolean':
        return (
          <Box key={element.name}>
            <Flex direction="column" gap="2">
              <Text as="legend" size="3" mb="1">{element.title}</Text>
              <RadioGroup.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value === 'true')}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name]?.toString() || ''}
                name={elementId}
              >
                <Text size="3">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="true" id={`${elementId}_true`}>Yes</RadioGroup.Item>
                  </Flex>
                </Text>
                <Text size="3">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="false" id={`${elementId}_false`}>No</RadioGroup.Item>
                  </Flex>
                </Text>
              </RadioGroup.Root>
            </Flex>
          </Box>
        );
      case 'text':
        return (
          <Box key={element.name}>
            <Flex direction="column" gap="2">
              <Text size="3" mb="4" htmlFor={elementId}>{element.title}</Text>
              <TextArea
                id={elementId}
                name={elementId}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name] || ''}
                onChange={(e) => handleInputChange(surveyData.pages[pageIndex].name, element.name, e.target.value)}
                size='3'
              />
            </Flex>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderPage = (page) => {
    return (
      <Box p='4'>
        <Text as="h2" size="7" mb="3">{page.title}</Text>
        <Text as="p" size="4">{page.description}</Text>
        <Separator mt="3" mb='5' size="4" />
        <Flex direction="column" gap="6">
          {page.elements.map(renderElement)}
        </Flex>
      </Box>
    );
  };

  return (
    <Container mt='8' size="2" height="60vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card p='4' align='center' style={{ width: '100%', maxWidth: '700px', justifyContent: 'center' }}>
        {renderPage(surveyData.pages[pageIndex])}
        <Flex gap="3" p='4' justify="between">
          <Box>
            {pageIndex > 0 && (
              <Button variant="surface" onClick={handlePrevious}>Previous</Button>
            )}
          </Box>
          <Box>
            {pageIndex < surveyData.pages.length - 1 ? (
              <Button variant="surface" onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="surface" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Flex align="center" gap="2">
                    <Spinner size="small" />
                    Submitting
                  </Flex>
                ) : (
                  'Submit'
                )}
              </Button>
            )}
          </Box>
        </Flex>
      </Card>
    </Container>
  );
};

export default Survey;