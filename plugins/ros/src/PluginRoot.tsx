import { Route, Routes } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { RiScPlugin } from './components/riScPlugin/RiScPlugin';
import { ScenarioProvider } from './contexts/ScenarioContext';
import { riScRouteRef, scenarioRouteRef } from './routes';
import { RiScProvider } from './contexts/RiScContext';
import '@backstage/ui/css/styles.css';
import 'remixicon/fonts/remixicon.css';
import { MuiFontProvider } from './components/MuiFontProvider.tsx';

const emotionInsertionPoint = document.createElement('meta');
emotionInsertionPoint.setAttribute('name', 'emotion-insertion-point');
document.querySelector('head')?.appendChild(emotionInsertionPoint);

const cache = createCache({
  key: 'css',
  insertionPoint: emotionInsertionPoint,
});

function ProvidedPlugin() {
  return (
    <CacheProvider value={cache}>
      <RiScProvider>
        <ScenarioProvider>
          <MuiFontProvider>
            <RiScPlugin />
          </MuiFontProvider>
        </ScenarioProvider>
      </RiScProvider>
    </CacheProvider>
  );
}

export function PluginRoot() {
  return (
    <Routes>
      <Route path="/" element={<ProvidedPlugin />} />
      <Route path={riScRouteRef.path} element={<ProvidedPlugin />} />
      <Route path={scenarioRouteRef.path} element={<ProvidedPlugin />} />
    </Routes>
  );
}
