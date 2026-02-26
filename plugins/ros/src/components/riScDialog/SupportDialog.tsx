import { ReactElement, useState } from 'react';
import { Button, Card, CardHeader, Flex, Link, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { FeedbackDialog } from '../riScPlugin/FeedbackDialog.tsx';
import dialogStyles from './RiScDialog.module.css';
import styles from './SupportDialog.module.css';
import DialogComponent from '../dialog/DialogComponent.tsx';

export function SupportDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        iconStart={<i className="ri-question-line" />}
      >
        {t('supportDialog.title')}
      </Button>
      <DialogComponent
        isOpen={open}
        onClick={() => setOpen(false)}
        header={t('supportDialog.title')}
        className={dialogStyles.createRiscDialog}
      >
        <Flex direction="column" gap="8px">
          <SupportEntry
            label={t('supportDialog.entries.riscFeedbackChannel.title')}
            url="https://kartverketgroup.slack.com/archives/C075KCPTURY"
            icon={
              <i className={`ri-slack-fill ${styles.supportIcon}`} />
            }
            description={t(
              'supportDialog.entries.riscFeedbackChannel.description',
            )}
          />
          <SupportEntry
            label={t('supportDialog.entries.riscDocumentation.title')}
            url="https://kartverket.atlassian.net/wiki/spaces/SIK/pages/1645608980/Koden+r+RoS"
            icon={
              <i className={`ri-article-line ${styles.supportIcon}`} />
            }
            description={t(
              'supportDialog.entries.riscDocumentation.description',
            )}
          />
        </Flex>
        <div className={styles.feedbackWrapper}>
          <FeedbackDialog open={open} setOpen={setOpen} />
        </div>
      </DialogComponent>
    </>
  );
}

type SupportEntryProps = {
  label: string;
  url: string;
  description: string;
  icon: ReactElement;
};

function SupportEntry(props: SupportEntryProps) {
  return (
    <Card className={styles.supportCard}>
      <CardHeader>
        <Flex align="center">
          {props.icon}
          <Flex direction="column" gap="0">
            <Text weight="bold">{props.label}</Text>
            <Link href={props.url} target="_blank">
              {props.description}
            </Link>
          </Flex>
        </Flex>
      </CardHeader>
    </Card>
  );
}
