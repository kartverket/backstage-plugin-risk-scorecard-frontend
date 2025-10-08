import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuthenticatedFetch } from '../utils/hooks.ts';
import { DefaultRiScType, DefaultRiScTypeDescriptor } from '../utils/types.ts';

type DefaultRiScTypesContextObject = {
  defaultRiScTypeDescriptors: DefaultRiScTypeDescriptor[];
  getDescriptorOfType: (
    type: DefaultRiScType,
  ) => DefaultRiScTypeDescriptor | null;
};

const DefaultRiScTypesContext = createContext<
  DefaultRiScTypesContextObject | undefined
>(undefined);

export function DefaultRiScTypesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { fetchDefaultRiScTypeDescriptors } = useAuthenticatedFetch();

  const [defaultRiScTypeDescriptors, setDefaultRiScTypeDescriptors] = useState<
    DefaultRiScTypeDescriptor[]
  >([]);

  useEffect(() => {
    fetchDefaultRiScTypeDescriptors(response => {
      setDefaultRiScTypeDescriptors(response);
    });
  }, [fetchDefaultRiScTypeDescriptors]);

  function getDescriptorOfType(
    type: DefaultRiScType,
  ): DefaultRiScTypeDescriptor | null {
    if (defaultRiScTypeDescriptors === undefined) return null;

    const descriptor = defaultRiScTypeDescriptors.find(
      value => value.riScType === type,
    );
    if (descriptor === undefined) return null;
    return descriptor;
  }

  return (
    <DefaultRiScTypesContext.Provider
      value={{ defaultRiScTypeDescriptors, getDescriptorOfType }}
    >
      {children}
    </DefaultRiScTypesContext.Provider>
  );
}

export function useDefaultRiScTypeDescriptors() {
  const context = useContext(DefaultRiScTypesContext);

  if (context === undefined) {
    throw new Error(
      'useDefaultRiScTypeDescriptors must be used within a DefaultRiScTypesContext provider',
    );
  }
  return context;
}
