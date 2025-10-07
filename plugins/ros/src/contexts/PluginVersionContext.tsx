import { createContext } from 'react';

const PLUGIN_VERSION_NUMBER = '3.6.0'; // Should always match the version specified in package.json
export const PluginVersionContext = createContext(PLUGIN_VERSION_NUMBER);
