import {
  pluginRiScNorwegianTranslation,
  pluginRiScTranslationRef,
} from './translations';

describe('Norwegian translations', () => {
  it('should have translations for all defined keys in translation ref', async () => {
    const flatten = (obj: any, prefix = ''): Record<string, string> =>
      Object.entries(obj).reduce(
        (acc, [key, value]) => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'string') {
            acc[path] = value;
          } else {
            Object.assign(acc, flatten(value, path));
          }
          return acc;
        },
        {} as Record<string, string>,
      );

    const expectedKeys = Object.keys(flatten(pluginRiScTranslationRef));
    const translatedKeys = Object.keys(pluginRiScNorwegianTranslation);

    expectedKeys.forEach(key => {
      expect(translatedKeys).toContain(key);
    });
  });

  it('should not have any empty values', async () => {
    const translatedValues = Object.values(pluginRiScNorwegianTranslation);

    translatedValues.forEach(expectation => expect(expectation).not.toBe(''));
  });
});
