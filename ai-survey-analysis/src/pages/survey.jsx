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
  Spinner,
  Progress,
  Callout
} from '@radix-ui/themes';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons'
import surveyData from '../data/survey.json';

const Survey = ({ onSubmitSuccess, isLoading }) => {
  const [formData, setFormData] = useState({});
  const [openEndedResponses, setOpenEndedResponses] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [showCallout, setShowCallout] = useState(false);

  const calculateProgress = useCallback(() => {
    const totalQuestions = surveyData.pages.reduce((acc, page) => acc + page.elements.length, 0);
    const answeredQuestions = Object.values(formData).reduce((acc, page) => acc + Object.keys(page).length, 0);
    return (answeredQuestions / totalQuestions) * 100;
  }, [formData]);

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
    setShowCallout(false);
  }, []);

  const validatePage = useCallback(() => {
    const currentPage = surveyData.pages[pageIndex];
    const requiredFields = currentPage.elements.filter(element => element.isRequired);
    const pageData = formData[currentPage.name] || {};

    for (const field of requiredFields) {
      if (field.type === 'rating') {
        if (pageData[field.name] === undefined || pageData[field.name] === null) {
          return false;
        }
      } else if (field.type === 'boolean') {
        if (pageData[field.name] === undefined) {
          return false;
        }
      } else {
        if (!pageData[field.name] || (typeof pageData[field.name] === 'string' && pageData[field.name].trim() === '')) {
          return false;
        }
      }
    }
    return true;
  }, [formData, pageIndex]);

  const handleNext = useCallback(() => {
    if (validatePage()) {
      setPageIndex(prev => Math.min(prev + 1, surveyData.pages.length - 1));
      setShowCallout(false);
    } else {
      setShowCallout(true);
    }
  }, [validatePage]);

  const handlePrevious = useCallback(() => {
    setPageIndex(prev => Math.max(prev - 1, 0));
    setShowCallout(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (validatePage()) {
      const responses = extractOpenEndedResponses();
      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess(responses);
      }
    } else {
      setShowCallout(true);
    }
  }, [extractOpenEndedResponses, onSubmitSuccess, validatePage]);

  const renderElement = (element) => {
    const elementId = `${surveyData.pages[pageIndex].name}_${element.name}`;
    const currentValue = formData[surveyData.pages[pageIndex].name]?.[element.name] || '';
    
    const requiredLabel = element.isRequired ? (
      <Text as="span" color="red" size="2" style={{ verticalAlign: 'super' }}>*</Text>
    ) : null;

    switch (element.type) {
      case 'rating':
        return (
          <Box key={element.name}>
            <Text size="3" mb="1" htmlFor={elementId}>{element.title} {requiredLabel}</Text>
            <Box mt="3">
              <Slider 
                value={[currentValue !== undefined ? currentValue : element.rateMin - 1]}
                min={element.rateMin}
                max={element.rateMax}
                step={1}
                id={elementId}
                name={elementId}
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value[0])}
              />
              <Flex justify="between" mt="2">
                <Text size="1">{element.minRateDescription || 'Lowest'}</Text>
                <Text size="1">{element.maxRateDescription || 'Highest'}</Text>
              </Flex>
              {element.rateDescriptions && currentValue !== undefined && (
                <Box mt="2">
                  <Text size="2">
                    Current rating: {currentValue} - {element.rateDescriptions[currentValue] || ''}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        );
      case 'dropdown':
        return (
          <Box key={element.name}>
            <Text size="3" mb="1" htmlFor={elementId}>{element.title} {requiredLabel}</Text>
            <Box mt="2">
              <Select.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value)}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name] || ''}
              >
                <Select.Trigger id={elementId} name={elementId} placeholder="Please Select" />
                <Select.Content position="popper">
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
              <Text as="legend" size="3" mb="1">{element.title} {requiredLabel}</Text>
              <RadioGroup.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value)}
                value={currentValue}
              >
                <Flex gap="2" direction="column">
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="true" id={`${elementId}_true`} />
                      Yes
                    </Flex>
                  </Text>
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="false" id={`${elementId}_false`} />
                      No
                    </Flex>
                  </Text>
                </Flex>
              </RadioGroup.Root>
            </Flex>
          </Box>
        );
      case 'text':
        return (
          <Box key={element.name}>
            <Flex direction="column" gap="2">
              <Text as="label" size="3" mb="4" htmlFor={elementId}>{element.title} {requiredLabel}</Text>
              <TextArea
                id={elementId}
                name={elementId}
                value={currentValue}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, 500); // Limit to 500 characters
                  handleInputChange(surveyData.pages[pageIndex].name, element.name, newValue);
                }}
                size='3'
                maxLength={500}
                placeholder="Please comment your opinion here..."
              />
              <Text size="1" style={{ alignSelf: 'flex-end', color: 'var(--gray-11)' }}>
                {500 - currentValue.length} characters remaining
              </Text>
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
    <Container my='8' mx="4" size="2" height="60vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card p='4' align='center' style={{ width: '100%', maxWidth: '700px', justifyContent: 'center' }}>
        <Box p="4">
          <Progress value={calculateProgress()} variant="surface" color="tomato" highContrast/>
        </Box>
        {renderPage(surveyData.pages[pageIndex])}
        {showCallout && (
          <Callout.Root color="red" role="alert" mt="4">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Please fill in all required (*) fields before proceeding.
            </Callout.Text>
          </Callout.Root>
        )}
        <Flex gap="3" p='4' justify="between">
          <Box>
            {pageIndex > 0 && (
              <Button variant="surface" onClick={handlePrevious} disabled={isLoading}>
                <ChevronLeftIcon/>Previous
              </Button>
            )}
          </Box>
          <Box>
            {pageIndex < surveyData.pages.length - 1 ? (
              <Button variant="surface" onClick={handleNext}>
                Next<ChevronRightIcon/>
              </Button>
            ) : (
              <Button variant="solid" onClick={handleSubmit} disabled={isLoading}>
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