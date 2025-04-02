import { createDevApp } from '@backstage/dev-utils';
import { riScPlugin, RiScPage } from '../src';

createDevApp()
  .registerPlugin(riScPlugin)
  .addPage({
    element: <RiScPage />,
    title: 'Root Page',
    path: '/risc',
  })
  .render();
