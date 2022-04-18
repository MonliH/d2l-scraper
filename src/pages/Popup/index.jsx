import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup';

function App() {
  return (
    <ChakraProvider>
      <Popup />
    </ChakraProvider>
  );
}

render(<App />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
