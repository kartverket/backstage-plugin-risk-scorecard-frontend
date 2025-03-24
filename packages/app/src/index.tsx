import '@backstage/cli/asset-types';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import posthog from 'posthog-js';
import { URLS } from './urls';

posthog.init('phc_5i5QBLfgf4FXS4hJlnkrLsAzQERS8PALDPmF2YVFQsB', {
  api_host: URLS.other.posthog,
});
ReactDOM.render(<App />, document.getElementById('root'));
