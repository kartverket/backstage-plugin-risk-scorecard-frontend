import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { rosPlugin, RosPage } from '../src/plugin';

createDevApp()
  .registerPlugin(rosPlugin)
  .addPage({
    element: <RosPage />,
    title: 'Root Page',
    path: '/ros'
  })
  .render();
