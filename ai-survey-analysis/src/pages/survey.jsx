"use client";
import { useState, useEffect, useCallback } from 'react';
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
} from '@radix-ui/themes';
import surveyData from '../data/survey.json';

const Survey = () => {
  const [formData, setFormData] = useState({});
  const [openEndedResponses, setOpenEndedResponses] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setOpenEndedResponses(openEnded);
  }, [formData]);
  

  useEffect(() => {
    extractOpenEndedResponses();
  }, [extractOpenEndedResponses]);

  const handleInputChange = (page, element, value) => {
    setFormData(prevData => ({
      ...prevData,
      [page]: {
        ...prevData[page],
        [element]: value
      }
    }));
  };

  const handleNext = () => {
    setDirection('next');
    setPageIndex(prev => Math.min(prev + 1, surveyData.pages.length - 1));
  };

  const handlePrevious = () => {
    setDirection('prev');
    setPageIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse('');

    // Log the final open-ended responses before submission
    console.log("Open-ended responses:", JSON.stringify(openEndedResponses, null, 2));

    // Check if there are any open-ended responses
    if (Object.keys(openEndedResponses).length === 0) {
      console.log("No open-ended questions found in the survey.");
      setResponse("No open-ended questions were found in the survey.");
      setIsLoading(false);
      return;
    }

    // Construct the prompt
    const prompt = `Analyze this data: ${JSON.stringify(openEndedResponses)}
    
    For each open-ended response, provide the following analysis:
    1. Summary: A short summary of the answer.
    2. Sentiment analysis: "Positive", "Neutral" or "Negative"
    3. Topic Category: Categorize the open-ended answer into a main topic. e.g. "Work Environment complaints"
    4. Action recommendation: One-sentence suggestion to solve the problem mentioned or improve the situation/effect in the answer.`;

    // Log the entire prompt
    console.log("Full prompt being sent to OpenAI:", prompt);

    try {
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setResponse(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'rating':
        return (
          <Box key={element.name}>
            <Text as="label" size="2" mb="1" htmlFor={element.name}>{element.title}</Text>
            <Box mt="3"> {/* Added top margin */}
              <Slider 
                defaultValue={[formData[surveyData.pages[pageIndex].name]?.[element.name] || 0]}
                min={element.rateMin}
                max={element.rateMax}
                step={1}
                id={element.name}
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value[0])}
              />
            </Box>
          </Box>
        );
      case 'dropdown':
        return (
          <Box key={element.name}>
            <Text as="label" size="2" mb="1" htmlFor={element.name}>{element.title}</Text>
            <Box mt="2"> {/* Added top margin to move dropdown to next line */}
              <Select.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value)}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name] || ''}
              >
                <Select.Trigger id={element.name} placeholder="Please Select" /> {/* Added placeholder */}
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
              <Text as="label" size="2" mb="1">{element.title}</Text>
              <RadioGroup.Root 
                onValueChange={(value) => handleInputChange(surveyData.pages[pageIndex].name, element.name, value === 'true')}
                value={formData[surveyData.pages[pageIndex].name]?.[element.name]?.toString() || ''}
              >
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="true">Yes</RadioGroup.Item>
                    </Flex>
                  </Text>
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="false">No</RadioGroup.Item>
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
              <Text as="label" size="2" mb="4" htmlFor={element.name}>{element.title}</Text>
              <TextArea
                id={element.name}
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
        <Text as="h2" size="6" mb="3">{page.title}</Text>
        <Text as="p" size="3">{page.description}</Text>
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
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </Box>
        </Flex>
        {(isLoading || response) && (
          <Box p="4">
            <Text as="h3" size="5" mb="2">AI Response:</Text>
            {isLoading ? (
              <Text size="3">Generating response...</Text>
            ) : (
              <Text size="3">{response}</Text>
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default Survey;

