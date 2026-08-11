import { slugify } from './slug.util';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Band Name')).toBe('band-name');
  });

  it('removes accents/diacritics', () => {
    expect(slugify('Café')).toBe('cafe');
  });

  it('collapses multiple special characters into a single dash', () => {
    expect(slugify('Band  &  Music')).toBe('band-music');
  });

  it('keeps numbers', () => {
    expect(slugify('Band 123')).toBe('band-123');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('  Band Name!!  ')).toBe('band-name');
  });

  it('uppercases input is fully lowercased', () => {
    expect(slugify('UPPERCASE')).toBe('uppercase');
  });

  it('returns an empty string for input with only special characters', () => {
    expect(slugify('!!!')).toBe('');
  });

  it('returns an empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});
