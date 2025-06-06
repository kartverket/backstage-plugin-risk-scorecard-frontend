import { makeStyles, Theme } from '@material-ui/core';

// Retrieved from Kartverket's colour profile
const white = '#FFFFFF';
const orange50 = '#FCEBCD';
const orange100 = '#FFDD9D';
const orange300 = '#CF914A';
const red100 = '#FFE2D4';
const red200 = '#EBB095';
const red400 = '#D04A14';
const red500 = '#A32F00';
const green100 = '#D0ECD6';
const green200 = '#9FD2AB';
const green300 = '#66B077';
const green500 = '#156630';
const gray50 = '#F5F2F2';
const gray400 = '#706F6E';
const gray600 = '#4A4848';
const gray900 = '#212121';

const removedColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? red100 : red500;
const addedColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? green100 : green500;

export const interactiveColor = (theme: Theme) =>
  theme.palette.type === 'dark' ? green200 : green500;

const fontColorLight = gray50;
const fontColorDark = gray900;

const fontSizeTitle = '18px';
const lineHeightTitle = '26px';
const fontSizeNormal = '14px';
export const fontWeightBold = 700;
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
    backgroundColor: theme.palette.type === 'dark' ? gray400 : orange50,
    marginBottom: '24px',
  },
  boxSecondary: {
    backgroundColor: theme.palette.type === 'dark' ? gray600 : white,
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
    backgroundColor: orange100,
    borderColor: orange300,
  },
  tagDelete: {
    backgroundColor: red200,
    borderColor: red400,
  },
  tagAdded: {
    backgroundColor: green100,
    borderColor: green300,
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
}));
