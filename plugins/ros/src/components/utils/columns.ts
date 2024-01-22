import { TableColumn } from '@backstage/core-components';

export const columns: TableColumn[] = [
  {
    title: 'Beskrivelse',
    field: 'beskrivelse',
    type: 'string',
  },
  {
    title: 'Trusselaktør',
    field: 'trussel',
    type: 'string',
  },
  {
    title: 'Sårbarhet',
    field: 'sårbarhet',
    type: 'string',
  },
  {
    title: 'Konsekvens',
    field: 'konsekvens',
    type: 'numeric',
  },
  {
    title: 'Sannsynlighet',
    field: 'sannsynlighet',
    type: 'numeric',
  },
];
