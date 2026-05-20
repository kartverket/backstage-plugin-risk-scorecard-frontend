import { ChangeSetTitle } from '../../changeset/components/ChangeSetTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../../utils/translations.ts';
import styles from './MigrationTitle.module.css';
import { Link, TooltipTrigger, Tooltip } from '@backstage/ui';

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
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <div className={styles.migrationTitle}>
      <ChangeSetTitle
        text={t('migrationDialog.migrationTitle', { to: to, from: from })}
      />
      <div className={styles.migrationChangelog}>
        <TooltipTrigger>
          <Link target="_blank" href={changelogUrl}>
            {t('migrationDialog.schemaChangelog')}{' '}
            <i className="ri-external-link-line" />
          </Link>
          <Tooltip>{migrationExplanation}</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
}
