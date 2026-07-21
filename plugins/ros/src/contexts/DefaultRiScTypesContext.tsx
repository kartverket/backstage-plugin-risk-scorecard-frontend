import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuthenticatedFetch } from '../utils/hooks.ts';
import { DefaultRiScTypeDescriptor, ProcessingStatus } from '../utils/types.ts';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations.ts';
import { withLoginRejected } from '../utils/fetchRiScHelpers.ts';

type DefaultRiScTypesContextObject = {
  defaultRiScTypeDescriptors: DefaultRiScTypeDescriptor[];
  riScSelectedByDefault: DefaultRiScTypeDescriptor | undefined;
  errorMessage: string | null;
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
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { entity } = useEntity();
  const [defaultRiScTypeDescriptors, setDefaultRiScTypeDescriptors] = useState<
    DefaultRiScTypeDescriptor[]
  >([]);
  const [riScSelectedByDefault, setRiScSelectedByDefault] = useState<
    DefaultRiScTypeDescriptor | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaultRiScTypeDescriptors(
      response => {
        setDefaultRiScTypeDescriptors(response);
        setRiScSelectedByDefault(getRiScSelectedByDefault(response));
        setErrorMessage(null);
      },
      (error, loginRejected) => {
        const message =
          error?.status === ProcessingStatus.FailedToFetchInitRiScFromGitHub ||
          error?.status ===
            ProcessingStatus.FailedToFetchInitRiScConfigFromGitHub
            ? t(`errorMessages.${error.status}`)
            : t('errorMessages.DefaultErrorMessage');
        setErrorMessage(withLoginRejected(message, loginRejected, t));
      },
    );
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
        errorMessage,
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
