"use client";
import { useState } from 'react';
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
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');

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

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Form submitted:', formData);
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
      <Box>
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
        <Box p='4'
          style={{
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            opacity: 1,
            transform: 'translateX(0)',
          }}
        >
          {renderPage(surveyData.pages[pageIndex])}
        </Box>
        <Flex gap="3" p='4' justify="between">
          <Box>
            {pageIndex > 0 && (
              <Button onClick={handlePrevious}>Previous</Button>
            )}
          </Box>
          <Box>
            {pageIndex < surveyData.pages.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
          </Box>
        </Flex>
      </Card>
    </Container>
  );
};

export default Survey;
