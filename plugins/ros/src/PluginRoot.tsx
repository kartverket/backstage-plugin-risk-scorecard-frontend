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

const ProvidedPlugin = () => (
  <CacheProvider value={cache}>
    <RiScProvider>
      <ScenarioProvider>
        <RiScPlugin />
      </ScenarioProvider>
    </RiScProvider>
  </CacheProvider>
);

export const PluginRoot = () => (
  <Routes>
    <Route path="/" element={<ProvidedPlugin />} />
    <Route path={riScRouteRef.path} element={<ProvidedPlugin />} />
    <Route path={scenarioRouteRef.path} element={<ProvidedPlugin />} />
  </Routes>
);
