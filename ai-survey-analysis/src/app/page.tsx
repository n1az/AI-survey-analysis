// pages/index.tsx
import { FC } from 'react';
import Survey from '../pages/surveyManager';
import { Text, Box, Container } from '@radix-ui/themes';

const Home: FC = () => {
  return (
    <div>
      <Box variant="surface" style={{ backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-1)', background: 'var(--mauve-a4)' }}>
        <Container size="1" align='center'>
          <Text as="p" size="8" my='8' align='center'>AI Survey Analysis</Text>
        </Container>
      </Box>
      <Box style={{ borderRadius: 'var(--radius-3)', alignItems: 'center' }}>
        <Survey />
      </Box>
    </div>
  );
};

export default Home;
