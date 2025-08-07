
'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

// Define a generic fetcher function that can be used by all SWR hooks.
// It handles basic JSON fetching and error handling.
const fetcher = async (url: string) => {
  const res = await fetch(url);

  // If the server responds with a non-2xx status code,
  // we should throw an error which will be caught by SWR.
  if (!res.ok) {
    const errorInfo = await res.json();
    const error = new Error(errorInfo.message || 'An error occurred while fetching the data.');
    // Attach extra info to the error object.
    // @ts-ignore
    error.info = errorInfo;
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

// Create the SWRProvider component.
export const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Optional: Add other global configurations here
        // For example, to refresh data every 5 minutes on window focus:
        // refreshInterval: 300000,
        // revalidateOnFocus: true,
      }}
    >
      {children}
    </SWRConfig>
  );
};
