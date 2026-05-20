import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { EXTERNAL_URLS } from '../../../urls/external';
import { Flex, Link, Text } from '@backstage/ui';

export function FeedbackLink() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex justify="end" mt="4">
      <Text as="p" variant="body-large">
        {t('rosStatus.feedbackDescription')}{' '}
        <Link
          target="_blank"
          rel="noreferrer"
          href={EXTERNAL_URLS.feedback_form}
        >
          {t('rosStatus.feedbackLink')} <i className="ri-external-link-line" />
        </Link>
      </Text>
    </Flex>
  );
}
