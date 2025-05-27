import { ChangeSetTitle } from './ChangeSetTitle.tsx';
import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@mui/material/Link';
import { HelpIcon } from '@backstage/core-components';
import { useChangeSetStyles } from './changeSetStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../../utils/translations.ts';

interface MigrationTitleProps {
  from: string;
  to: string;
  migrationExplanation: string;
  changelogUrl: string;
}

export function MigrationTitle({
  from,
  to,
  migrationExplanation,
  changelogUrl,
}: MigrationTitleProps) {
  const { migrationTitle, migrationChangelog } = useChangeSetStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <div className={migrationTitle}>
      <ChangeSetTitle text={t("migrationDialog.migrationTitle", {to: to, from: from})} />
      <div className={migrationChangelog}>
        <Tooltip title={migrationExplanation}>
          <Link target="_blank" href={changelogUrl} color="inherit">
            {t('migrationDialog.schemaChangelog')}
            <IconButton color="inherit" size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}
