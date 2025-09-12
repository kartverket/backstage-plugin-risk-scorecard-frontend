import { ReactElement, useState } from 'react';
import { Button, Card, CardHeader, Flex, Text } from '@backstage/ui';
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

export function SupportDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        iconStart={<i className="ri-question-line"></i>}
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
              label={t('supportDialog.entries.documentation')}
              url="https://skip.kartverket.no/docs"
              icon={
                <i
                  className="ri-article-line"
                  style={{ fontSize: 'x-large' }}
                ></i>
              }
            />
            <SupportEntry
              label={t('supportDialog.entries.slackChannel')}
              url="https://kartverketgroup.slack.com/archives/C028ZEED280"
              icon={
                <i
                  className="ri-slack-fill"
                  style={{ fontSize: 'x-large' }}
                ></i>
              }
            />
            <SupportEntry
              label={t('supportDialog.entries.riscFeedbackChannel')}
              url="https://kartverketgroup.slack.com/archives/C075KCPTURY"
              icon={
                <i
                  className="ri-slack-fill"
                  style={{ fontSize: 'x-large' }}
                ></i>
              }
            />
            <SupportEntry
              label={t('supportDialog.entries.riscDocumentation')}
              url="https://kartverket.atlassian.net/wiki/spaces/SIK/pages/1176142023/Koden+r+RoS"
              icon={
                <i
                  className="ri-article-line"
                  style={{ fontSize: 'x-large' }}
                ></i>
              }
            />
            <SupportEntry
              label={t('supportDialog.entries.securityMetricsFeedbackChannel')}
              url="https://kartverketgroup.slack.com/archives/C07RNB2LPUZ"
              icon={
                <i
                  className="ri-slack-fill"
                  style={{ fontSize: 'x-large' }}
                ></i>
              }
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
  icon: ReactElement;
};

function SupportEntry(props: SupportEntryProps) {
  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Flex align="center">
            {props.icon}
            <Text variant="body-large" weight="bold">
              {props.label}
            </Text>
          </Flex>
          <Button onClick={() => window.open(props.url, '_blank')}>Open</Button>
        </Flex>
      </CardHeader>
    </Card>
  );
}
