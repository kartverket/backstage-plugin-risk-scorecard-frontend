import React from 'react';
import { rosRouteRef, scenarioRouteRef } from '../../routes';
import { Route, Routes } from 'react-router-dom';
import { ROSPlugin } from './ROSPlugin';

export const Plugin = () => {
  return (
    <Routes>
      <Route path="/" element={<ROSPlugin />} />
      <Route path={rosRouteRef.path} element={<ROSPlugin />} />
      <Route path={scenarioRouteRef.path} element={<ROSPlugin />} />
    </Routes>
  );
};
