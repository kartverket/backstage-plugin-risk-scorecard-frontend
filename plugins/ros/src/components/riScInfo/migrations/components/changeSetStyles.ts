import { makeStyles, Theme } from '@material-ui/core';

const removedColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? '#FFD4C2' : '#D04A14';
const addedColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? '#99EFB6' : '#156630';

const interactiveColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? '#99EFB6' : '#156630';

const fontColorLight = '#FFFFFF';
const fontColorDark = '#333333';

const fontSizeTitle = '18px';
const lineHeightTitle = '26px';
const fontSizeNormal = '14px';
const fontWeightBold = 700;
const fontWeightSemiBold = 500;

export const useChangeSetStyles = makeStyles((theme: Theme) => ({
  // ChangeSetBox
  box: {
    padding: '14px 18px',
    height: '100%',
    borderRadius: '24px',
    color: theme.palette.type === 'dark' ? fontColorLight : fontColorDark,
    fontSize: fontSizeNormal,
  },
  boxPrimary: {
    backgroundColor: theme.palette.type === 'dark' ? '#616161' : '#FCEBCD',
    marginBottom: '24px',
  },
  boxSecondary: {
    backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#FFFFFF',
    marginBottom: '12px',
  },

  // ChangeSetBoxTitle
  boxTitle: {
    fontWeight: fontWeightBold,
    fontSize: fontSizeTitle,
    lineHeight: '26px',
    marginBottom: '12px',
  },

  // ChangeSetChangedValue
  changedProperty: {
    fontWeight: fontWeightBold,
  },
  oldValue: {
    fontWeight: fontWeightBold,
    color: removedColor(theme),
    textDecoration: 'line-through',
  },
  newValue: {
    fontWeight: fontWeightBold,
    color: addedColor(theme),
  },

  // ChangeSetRemovedProperty
  removedPropertyContainer: {
    marginBottom: '8px',
  },
  removedProperty: {
    fontWeight: fontWeightBold,
    color: removedColor(theme),
    textDecoration: 'line-through',
    fontSize: fontSizeTitle,
    lineHeight: lineHeightTitle,
  },
  removedValue: {
    fontWeight: fontWeightSemiBold,
    color: removedColor(theme),
    textDecoration: 'line-through',
    fontSize: fontSizeNormal,
  },

  // ChangeSetTag
  tag: {
    borderRadius: '24px',
    width: 'fit-content',
    padding: '1px 8px',
    border: '1px solid',
    color: fontColorDark,
  },
  tagPrimary: {
    backgroundColor: '#FFDD9D',
    borderColor: theme.palette.type === 'dark' ? '#FF9625' : '#333333',
  },
  tagDelete: {
    backgroundColor: '#FF6E60',
    borderColor: '#C43631',
  },

  // ChangeSetTags
  tags: {
    marginBottom: '4px',
    display: 'flex',
    gap: '4px',
  },

  // ChangeSetText
  text: {
    fontWeight: fontWeightSemiBold,
    color: theme.palette.type === 'dark' ? fontColorLight : fontColorDark,
  },

  // ChangeSetTitle
  title: {
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: theme.palette.type === 'dark' ? fontColorLight : fontColorDark,
    fontWeight: fontWeightBold,
    fontSize: fontSizeNormal,
    marginBottom: '12px',
  },

  // MigrationTitle
  migrationTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '4px',
  },
  migrationChangelog: {
    color: interactiveColor(theme),
    fontWeight: fontWeightBold,
  },
}));
