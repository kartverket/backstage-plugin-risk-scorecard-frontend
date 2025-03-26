import { renderWithEffects } from '@backstage/test-utils';
import React from 'react';
import App from './App';
import { URLS } from './urls';

describe('App', () => {
  it('should render', async () => {
    process.env = {
      NODE_ENV: 'test',
      APP_CONFIG: [
        {
          data: {
            app: { title: 'Test' },
            backend: { baseUrl: URLS.backend.index },
            techdocs: {
              storageUrl: URLS.backend.docs,
            },
          },
          context: 'test',
        },
      ] as any,
    };

    const rendered = await renderWithEffects(<App />);
    expect(rendered.baseElement).toBeInTheDocument();
  });
});
