/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/** Main directory to group playwright stuff. */
export const testDir = './playwright';

const playwrightEnvFile = path.resolve(__dirname, testDir, '.env');

// Load playwright environment variables.
dotenv.config({ path: playwrightEnvFile });

/** File to save browser context after authentication. */
export const authFile = path.join(__dirname, testDir, '.auth/user.json');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60_000,

  expect: {
    timeout: 5_000,
  },

  testDir: testDir,

  // Run your local dev server before starting the tests
  webServer: process.env.CI
    ? []
    : [
        {
          command: 'yarn dev',
          port: 3000,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      ],

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],

  use: {
    actionTimeout: 0,
    baseURL:
      process.env.PLAYWRIGHT_URL ??
      (process.env.CI ? 'http://localhost:7007' : 'http://localhost:3000'),
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  outputDir: 'node_modules/.cache/e2e-test-results',

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'e2e',
      testMatch: /.*\.test\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});
