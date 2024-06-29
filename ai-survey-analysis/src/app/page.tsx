// pages/index.tsx
import { FC } from 'react';
import Survey from '../pages/Survey';
import { Theme, Heading, Box, Container } from '@radix-ui/themes';

const Home: FC = () => {
  return (
    <div>
      <Box style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
        <Container size="1" align='center'>
          <Heading size="8" my='8' align='center'>Welcome to the Survey</Heading>
        </Container>
      </Box>
      <Box style={{ borderRadius: 'var(--radius-3)', alignItems: 'center' }}>
        <Survey />
      </Box>
    </div>
  );
};

export default Home;
