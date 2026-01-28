import { MigrationChanges53 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetText } from '../changeset/components/ChangeSetText.tsx';
import { useBackstageContext } from '../../../contexts/BackstageContext.tsx';
import { Link } from '@backstage/ui';
import { useEntityUrl } from '../../../utils/backstage.ts';
import {
  Entity,
  isComponentEntity,
  isSystemEntity,
} from '@backstage/catalog-model';
import { useChangeSetStyles } from '../changeset/components/changeSetStyles.ts';

interface RiScMigrationChanges53Props {
  changes: MigrationChanges53;
}

export function RiScMigrationChanges53(props: RiScMigrationChanges53Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const styles = useChangeSetStyles();

  const { currentEntity, useBackstageRepoOfCurrentEntity } =
    useBackstageContext();

  const backstageRepo = useBackstageRepoOfCurrentEntity(true);

  let kindText = '';
  if (isSystemEntity(currentEntity)) {
    kindText = t('dictionary.theSystem');
  } else if (isComponentEntity(currentEntity)) {
    kindText = t('dictionary.theComponent');
  } else {
    kindText = currentEntity.kind;
  }

  const initializedToText = t('migrationDialog.migration53.initializedTo', {
    kind: kindText,
    title: currentEntity.metadata.title
      ? `(${t('dictionary.title').toLowerCase()}: "${currentEntity.metadata.title}")`
      : '',
    entityRef: props.changes.metadataUnencrypted.backstage.entityRef,
    name: currentEntity.metadata.name,
  });

  return (
    <>
      <MigrationTitle
        from="5.2"
        to="5.3"
        migrationExplanation={t(
          'migrationDialog.migration53.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#53"
      />
      <ChangeSetBox type="primary">
        <ChangeSetBoxTitle title={t('migrationDialog.migration53.title')} />
        <ChangeSetText
          text={t('migrationDialog.migration53.changeExplanation')}
        />
        <p className={styles.text}>
          <strong>{initializedToText}</strong>
        </p>
        {backstageRepo.entitiesOfRepo.length > 0 && (
          <>
            <p className={styles.text} style={{ marginTop: '32px' }}>
              <i>{t('migrationDialog.migration53.warning')}</i>
            </p>
            <ul
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {backstageRepo.entitiesOfRepo.map(e => (
                <li>
                  <EntityLink entity={e} />
                </li>
              ))}
            </ul>
          </>
        )}
      </ChangeSetBox>
    </>
  );
}

type EntityLinkProps = {
  entity: Entity;
};

function EntityLink(props: EntityLinkProps) {
  const styles = useChangeSetStyles();
  const entityUrl = useEntityUrl(props.entity);
  return (
    <Link className={styles.text} href={entityUrl} target="_blank">
      {props.entity.metadata.title ?? props.entity.metadata.name} (
      {props.entity.kind})
    </Link>
  );
}
