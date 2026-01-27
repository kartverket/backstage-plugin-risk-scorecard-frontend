import { Flex, Text, Card, CardBody, ButtonIcon } from '@backstage/ui';
import { RiScWithMetadata } from '../../utils/types';
import { Markdown } from '../common/Markdown.tsx';
import styles from './RiScSelectionCard.module.css';

interface Props {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
}

export function RiScDescriptionCard(props: Props) {
  return (
    <Flex>
      <Card>
        <CardBody>
          <Flex
            justify="between"
            align="center"
            className={styles.riscDescriptionComponent}
          >
            <Text variant="title-small" as="h6" weight="bold">
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
