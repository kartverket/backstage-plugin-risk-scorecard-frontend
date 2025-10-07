import { ReactElement, useState } from 'react';
import { Button, Card, CardHeader, Flex, Text } from '@backstage/ui';
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Link } from '@mui/material';

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
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{t('supportDialog.title')}</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <SupportEntry
              label={t('supportDialog.entries.riscFeedbackChannel.title')}
              url="https://kartverketgroup.slack.com/archives/C075KCPTURY"
              icon={
                <i className="ri-slack-fill" style={{ fontSize: 'x-large' }} />
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
            <SupportEntry
              label={t(
                'supportDialog.entries.securityMetricsFeedbackChannel.title',
              )}
              url="https://kartverketgroup.slack.com/archives/C07RNB2LPUZ"
              icon={
                <i className="ri-slack-fill" style={{ fontSize: 'x-large' }} />
              }
              description={t(
                'supportDialog.entries.securityMetricsFeedbackChannel.description',
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
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
