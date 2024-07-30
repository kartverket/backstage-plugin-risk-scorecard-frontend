import React from 'react';
import { useRoutes } from 'react-router-dom';
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
  const pluginRoutes = useRoutes(
    ['/home', riScRouteRef.path, scenarioRouteRef.path].map(path => ({
      path,
      element: <RiScPlugin />,
    })),
  );

  return (
    <CacheProvider value={cache}>
      <RiScProvider>
        <ScenarioProvider>{pluginRoutes}</ScenarioProvider>
      </RiScProvider>
    </CacheProvider>
  );
};
