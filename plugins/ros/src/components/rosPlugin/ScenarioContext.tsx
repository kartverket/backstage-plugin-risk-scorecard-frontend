import { createContext } from 'react';
import { ScenarioDrawerProps } from '../utils/hooks';

export const ScenarioContext = createContext<ScenarioDrawerProps | null>(null);
