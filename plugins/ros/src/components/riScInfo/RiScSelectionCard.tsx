import { Markdown } from '../common/Markdown.tsx';
import { RiScWithMetadata } from '../../utils/types.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Card, CardBody, Text, Select, ButtonIcon, Flex } from '@backstage/ui';

interface Props {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  onCreateNew: () => void;
}

export function RiScSelectionCard(props: Props) {
  const { riScs, selectedRiSc, selectRiSc } = useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex direction="column" gap="24px">
      <Flex direction="column" className="SelectTrigger">
        {riScs !== null && riScs.length !== 0 && (
          <>
            <Select
              aria-label={t('contentHeader.multipleRiScs')}
              options={riScs.map(riSc => ({
                value: riSc.id,
                label: riSc.content.title,
              }))}
              onSelectionChange={key => {
                if (key) selectRiSc(key.toString());
              }}
              defaultSelectedKey={selectedRiSc?.id ?? ''}
              size="medium"
            />
          </>
        )}
      </Flex>
      <Card>
        <CardBody>
          <Flex
            justify="between"
            align="center"
            style={{
              marginBottom: '16px',
              marginTop: '8px',
            }}
          >
            <Text variant="title-x-small" as="h5" weight="bold">
              {props.riScWithMetadata.content.title}
            </Text>
            <ButtonIcon
              onClick={props.edit}
              icon={
                <i className="ri-edit-line" style={{ fontSize: 'large' }} />
              }
              variant="tertiary"
            />
          </Flex>
          <Markdown description={props.riScWithMetadata.content.scope} />
        </CardBody>
      </Card>
    </Flex>
  );
}
