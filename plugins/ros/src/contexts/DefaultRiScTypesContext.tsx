import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuthenticatedFetch } from '../utils/hooks.ts';
import { DefaultRiScTypeDescriptor } from '../utils/types.ts';
import { useEntity } from '@backstage/plugin-catalog-react';

type DefaultRiScTypesContextObject = {
  defaultRiScTypeDescriptors: DefaultRiScTypeDescriptor[];
  riScSelectedByDefault: DefaultRiScTypeDescriptor | undefined;
  getDescriptorOfId: (id: string) => DefaultRiScTypeDescriptor | undefined;
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
  const { entity } = useEntity();
  const [defaultRiScTypeDescriptors, setDefaultRiScTypeDescriptors] = useState<
    DefaultRiScTypeDescriptor[]
  >([]);
  const [riScSelectedByDefault, setRiScSelectedByDefault] = useState<
    DefaultRiScTypeDescriptor | undefined
  >(undefined);

  useEffect(() => {
    fetchDefaultRiScTypeDescriptors(response => {
      setDefaultRiScTypeDescriptors(response);
      setRiScSelectedByDefault(getRiScSelectedByDefault(response));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getRiScSelectedByDefault(
    descriptors: DefaultRiScTypeDescriptor[],
  ): DefaultRiScTypeDescriptor | undefined {
    const componentType = entity.spec?.type as string | undefined;

    if (!componentType) {
      if (descriptors.length > 0) return descriptors[0];
      return undefined;
    }

    const selectedDescriptor = descriptors.find(
      descriptor =>
        descriptor.preferredBackstageComponentType === componentType,
    );
    if (!selectedDescriptor && descriptors.length > 0) return descriptors[0];
    return selectedDescriptor;
  }

  function getDescriptorOfId(
    id: string,
  ): DefaultRiScTypeDescriptor | undefined {
    return defaultRiScTypeDescriptors.find(descriptor => descriptor.id === id);
  }

  return (
    <DefaultRiScTypesContext.Provider
      value={{
        defaultRiScTypeDescriptors,
        riScSelectedByDefault,
        getDescriptorOfId,
      }}
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
