import { Box, Button, ChakraProvider, Text } from '@chakra-ui/react';
import React, { useState } from 'react';

const Popup = () => {
  const [currTab, setCurrTab] = useState<chrome.tabs.Tab | undefined>(
    undefined
  );
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    setCurrTab(currentTab);
  });
  if (typeof currTab === 'undefined') return <></>;

  const matches = currTab.url!.match(
    new RegExp('https?:\\/\\/ldsb.elearningontario.ca\\/d2l\\/le\\/lessons\\/*')
  );

  return (
    <ChakraProvider>
      <Box p="25">
        <Text fontSize="md">D2L Scraper</Text>
        <Button
          colorScheme="blue"
          disabled={!matches?.length}
          onClick={() => {
            chrome.tabs.sendMessage(currTab.id!, { type: 'download' });
          }}
        >
          Download data
        </Button>
        {!matches && (
          <Text fontSize="sm" mt="1" color="red.500">
            Please go to a "content" tab in one of your courses on D2L
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default Popup;
