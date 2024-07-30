import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { RiScPlugin } from './components/riScPlugin/RiScPlugin';
import { ScenarioProvider } from './contexts/ScenarioContext';
import { riScRouteRef, scenarioRouteRef } from './routes';
import { RiScProvider } from './contexts/RiScContext';

const emotionInsertionPoint = document.createElement('meta');
emotionInsertionPoint.setAttribute('name', 'emotion-insertion-point');
document.querySelector('head')?.appendChild(emotionInsertionPoint);

const cache = createCache({
  key: 'css',
  insertionPoint: emotionInsertionPoint,
});

export const PluginRoot = () => {
  return (
    <CacheProvider value={cache}>
      <RiScProvider>
        <ScenarioProvider>
          <Routes>
            <Route path="/" element={<RiScPlugin />} />
            <Route path={riScRouteRef.path} element={<RiScPlugin />} />
            <Route path={scenarioRouteRef.path} element={<RiScPlugin />} />
          </Routes>
        </ScenarioProvider>
      </RiScProvider>
    </CacheProvider>
  );
};
