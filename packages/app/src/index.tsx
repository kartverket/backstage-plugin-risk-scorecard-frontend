import '@backstage/cli/asset-types';
import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';
import posthog from 'posthog-js';
import { URLS } from './urls';

posthog.init('phc_5i5QBLfgf4FXS4hJlnkrLsAzQERS8PALDPmF2YVFQsB', {
  api_host: URLS.external.eu_posthog_com,
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  /*
  Strict mode is recommended in React 18.
  It helps to identify potential problems in an application.
  It renders components twice in development mode (not in production).
  This is a helpful way to find side effects in the code.
  Double renders will expose flaky components when they are not pure,
  returning different results even though props are equal.
  StrictMode is not required, but it is a good practice to use it.
  It can be enabled later after issues are fixed.
  Current state is that the project will crash when used, reason unknown.
  */
  // <StrictMode>
  <App />,
  // </StrictMode>,
);
