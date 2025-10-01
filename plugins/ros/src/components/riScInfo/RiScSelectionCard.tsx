import { Markdown } from '../common/Markdown.tsx';
import { RiScWithMetadata } from '../../utils/types.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import {
  Card,
  CardBody,
  CardHeader,
  Text,
  Select,
  ButtonIcon,
  Flex,
} from '@backstage/ui';
import { CreateNewRiScButton } from './CreateNewRiScButton.tsx';

interface Props {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  onCreateNew: () => void;
}

export function RiScSelectionCard(props: Props) {
  const { riScs, selectedRiSc, selectRiSc } = useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Card>
      <CardHeader>
        {riScs !== null && riScs.length !== 0 && (
          <>
            <Flex
              justify="between"
              style={{
                marginBottom: '16px',
              }}
            >
              <Text variant="title-small" as="h6" weight="bold">
                {t('contentHeader.multipleRiScs')}
              </Text>
              <CreateNewRiScButton onCreateNew={props.onCreateNew} />
            </Flex>
            <Select
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
      </CardHeader>
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
              <i className="ri-pencil-line" style={{ fontSize: 'x-large' }} />
            }
            variant="tertiary"
          />
        </Flex>
        <Markdown description={props.riScWithMetadata.content.scope} />
      </CardBody>
    </Card>
  );
}
