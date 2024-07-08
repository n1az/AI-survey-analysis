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

// Main Survey component
const Survey = ({ onSubmitSuccess, isLoading }) => {
  // State management
  // formData: Stores all survey responses
  const [formData, setFormData] = useState({});
  // openEndedResponses: Stores only the open-ended (text) responses
  const [openEndedResponses, setOpenEndedResponses] = useState({});
  // pageIndex: Tracks the current page of the survey
  const [pageIndex, setPageIndex] = useState(0);
  // showCallout: Controls visibility of error message for incomplete required fields
  const [showCallout, setShowCallout] = useState(false);

  // Calculate progress of survey completion
  const calculateProgress = useCallback(() => {
    // Count total questions across all pages
    const totalQuestions = surveyData.pages.reduce((acc, page) => acc + page.elements.length, 0);
    // Count answered questions by summing the number of responses for each page
    const answeredQuestions = Object.values(formData).reduce((acc, page) => acc + Object.keys(page).length, 0);
    // Calculate and return the percentage of completion
    return (answeredQuestions / totalQuestions) * 100;
  }, [formData]);

  // Extract open-ended responses for submission
  const extractOpenEndedResponses = useCallback(() => {
    const openEnded = {};
    surveyData.pages.forEach(page => {
      page.elements.forEach(element => {
        // Check if the element is a text input
        if (element.type === 'text') {
          const response = formData[page.name]?.[element.name];
          openEnded[`${element.name}`] = {
            question: element.title,
            // If response exists and is not empty, use it; otherwise, use default message
            answer: response && response.trim() !== '' ? response : "Not Provided by user"
          };
        }
      });
    });
    return openEnded;
  }, [formData]);

  // Update open-ended responses when form data changes
  useEffect(() => {
    // This effect runs whenever formData changes, updating openEndedResponses
    setOpenEndedResponses(extractOpenEndedResponses());
  }, [extractOpenEndedResponses]);

  // Handle input changes
  const handleInputChange = useCallback((page, element, value) => {
    setFormData(prevData => ({
      ...prevData,
      [page]: {
        ...prevData[page],
        [element]: value
      }
    }));
    // Hide error message when user starts filling in fields
    setShowCallout(false);
  }, []);

  // Validate current page
  const validatePage = useCallback(() => {
    const currentPage = surveyData.pages[pageIndex];
    // Filter out required fields for the current page
    const requiredFields = currentPage.elements.filter(element => element.isRequired);
    const pageData = formData[currentPage.name] || {};

    for (const field of requiredFields) {
      if (field.type === 'rating') {
        // For rating, check if a value is selected (not undefined or null)
        if (pageData[field.name] === undefined || pageData[field.name] === null) {
          return false;
        }
      } else if (field.type === 'boolean') {
        // For boolean, check if a value is selected (not undefined)
        if (pageData[field.name] === undefined) {
          return false;
        }
      } else {
        // For other types, check if value exists and is not just whitespace
        if (!pageData[field.name] || (typeof pageData[field.name] === 'string' && pageData[field.name].trim() === '')) {
          return false;
        }
      }
    }
    return true;
  }, [formData, pageIndex]);

  // Handle next page navigation
  const handleNext = useCallback(() => {
    if (validatePage()) {
      // If current page is valid, move to next page
      setPageIndex(prev => Math.min(prev + 1, surveyData.pages.length - 1));
      setShowCallout(false);
    } else {
      // If current page is invalid, show error message
      setShowCallout(true);
    }
  }, [validatePage]);

  // Handle previous page navigation
  const handlePrevious = useCallback(() => {
    // Move to previous page, ensuring we don't go below 0
    setPageIndex(prev => Math.max(prev - 1, 0));
    // Hide error message when navigating back
    setShowCallout(false);
  }, []);

  // Handle survey submission
  const handleSubmit = useCallback(() => {
    if (validatePage()) {
      // If final page is valid, extract responses and call the success callback
      const responses = extractOpenEndedResponses();
      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess(responses);
      }
    } else {
      // If final page is invalid, show error message
      setShowCallout(true);
    }
  }, [extractOpenEndedResponses, onSubmitSuccess, validatePage]);

  // Render individual survey elements
  const renderElement = (element) => {
    const elementId = `${surveyData.pages[pageIndex].name}_${element.name}`;
    const currentValue = formData[surveyData.pages[pageIndex].name]?.[element.name] || '';
    
    // Create a required field indicator if the field is required
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
              {/* Show current rating description if available */}
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
                  // Limit text input to 500 characters
                  const newValue = e.target.value.slice(0, 500);
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

  // Render a single page of the survey
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

  // Main component render
  return (
    <Container my='8' mx="4" size="2" height="60vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card p='4' align='center' style={{ width: '100%', maxWidth: '700px', justifyContent: 'center' }}>
        {/* Progress bar */}
        <Box p="4">
          <Progress value={calculateProgress()} variant="surface" color="tomato" highContrast/>
        </Box>
        {/* Current page content */}
        {renderPage(surveyData.pages[pageIndex])}
        {/* Error message for incomplete required fields */}
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
        {/* Navigation buttons */}
        <Flex gap="3" p='4' justify="between">
          <Box>
            {/* Show 'Previous' button if not on the first page */}
            {pageIndex > 0 && (
              <Button variant="surface" onClick={handlePrevious} disabled={isLoading}>
                <ChevronLeftIcon/>Previous
              </Button>
            )}
          </Box>
          <Box>
            {/* Show 'Next' button if not on the last page, otherwise show 'Submit' */}
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