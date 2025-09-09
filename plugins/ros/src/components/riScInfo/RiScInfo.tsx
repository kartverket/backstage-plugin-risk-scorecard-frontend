import { RiScWithMetadata } from '../../utils/types';
import { Box, Grid } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { useRiScs } from '../../contexts/RiScContext';
import { Markdown } from '../common/Markdown';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Select,
  Icon,
} from '@backstage/ui';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  onCreateNew: () => void;
}

export function RiScInfo({
  riScWithMetadata,
  edit,
  onCreateNew,
}: RiScInfoProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { approveRiSc, riScs, selectedRiSc, selectRiSc } = useRiScs();

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card>
          <CardHeader>
            {riScs !== null && riScs.length !== 0 && (
              <div>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Text
                    as="h6"
                    variant={'title-small'}
                    style={{ marginBottom: 1 }}
                  >
                    {t('contentHeader.multipleRiScs')}
                  </Text>
                  <Button
                    iconStart={<Icon name="plus" />}
                    variant="primary"
                    onClick={onCreateNew}
                    style={{
                      alignItems: 'right',
                    }}
                  >
                    {t('contentHeader.createNewButton')}
                  </Button>
                </Box>
                <Select
                  name="font"
                  options={riScs.map(riSc => ({
                    value: riSc.id,
                    label: riSc.content.title,
                  }))}
                  onSelectionChange={key => {
                    if (key) selectRiSc(key.toString());
                  }}
                  defaultSelectedKey={selectedRiSc?.id ?? ''}
                  size={'medium'}
                />
              </div>
            )}
          </CardHeader>
          <CardBody>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text as="h5" variant="title-small" weight="bold">
                {riScWithMetadata.content.title}
              </Text>
              <Button onClick={edit}>{t('contentHeader.editRiSc')}</Button>
            </Box>
            <Markdown description={riScWithMetadata.content.scope} />
          </CardBody>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <RiScStatusComponent
          selectedRiSc={riScWithMetadata}
          publishRiScFn={approveRiSc}
        />
      </Grid>
    </Grid>
  );
}
