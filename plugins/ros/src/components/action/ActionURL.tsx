import { Box, Link, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type ActionURLProps = {
  url: string;
};

export function ActionURL(props: ActionURLProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Box mt="16px">
      <Text as="p" variant="body-large" weight="bold">
        {' '}
        {t('dictionary.url')}
      </Text>
      {props.url ? (
        <Link
          target="_blank"
          variant="body-large"
          rel="noreferrer"
          href={props.url.startsWith('http') ? props.url : `//${props.url}`}
        >
          {props.url}
        </Link>
      ) : (
        <Text as="p" variant="body-large" style={{ fontStyle: 'italic' }}>
          {t('dictionary.emptyField', {
            field: t('dictionary.url').toLowerCase(),
          })}
        </Text>
      )}
    </Box>
  );
}
