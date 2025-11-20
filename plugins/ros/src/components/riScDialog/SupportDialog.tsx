import { ReactElement, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Flex,
  Text,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Link } from '@mui/material';
import { FeedbackDialog } from '../riScPlugin/FeedbackDialog.tsx';
import styles from './RiScDialog.module.css';

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
      <DialogTrigger>
        <Dialog
          isOpen={open}
          onOpenChange={() => setOpen(false)}
          className={styles.createRiscDialog}
        >
          <DialogHeader className={styles.riscDialogTitle}>
            <Text variant="title-small" weight="bold">
              {t('supportDialog.title')}
            </Text>
          </DialogHeader>
          <DialogBody className={styles.riscDialogBodyNoFooter}>
            <Flex direction="column" gap="8px">
              <SupportEntry
                label={t('supportDialog.entries.riscFeedbackChannel.title')}
                url="https://kartverketgroup.slack.com/archives/C075KCPTURY"
                icon={
                  <i
                    className="ri-slack-fill"
                    style={{ fontSize: 'x-large' }}
                  />
                }
                description={t(
                  'supportDialog.entries.riscFeedbackChannel.description',
                )}
              />
              <SupportEntry
                label={t('supportDialog.entries.riscDocumentation.title')}
                url="https://kartverket.atlassian.net/wiki/spaces/SIK/pages/1645608980/Koden+r+RoS"
                icon={
                  <i
                    className="ri-article-line"
                    style={{ fontSize: 'x-large' }}
                  />
                }
                description={t(
                  'supportDialog.entries.riscDocumentation.description',
                )}
              />
            </Flex>
            <div style={{ marginTop: '24px' }}>
              <FeedbackDialog open={open} setOpen={setOpen} />
            </div>
          </DialogBody>
        </Dialog>
      </DialogTrigger>
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
    <Card>
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
