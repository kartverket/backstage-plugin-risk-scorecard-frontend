import React from 'react';
import { rosRouteRef, scenarioRouteRef } from '../../routes';
import { Route, Routes } from 'react-router-dom';
import { ROSPlugin } from './ROSPlugin';
import { useRouteRefParams } from '@backstage/core-plugin-api';

export const Plugin = () => {
  return (
    <Routes>
      <Route path="/" element={<ROSPlugin params={{}} />} />
      <Route
        path={rosRouteRef.path}
        element={<ROSPlugin params={useRouteRefParams(rosRouteRef)} />}
      />
      <Route
        path={scenarioRouteRef.path}
        element={<ROSPlugin params={useRouteRefParams(scenarioRouteRef)} />}
      />
    </Routes>
  );
};
