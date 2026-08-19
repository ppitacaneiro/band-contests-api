import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBandDto } from './create-band.dto';

describe('CreateBandDto', () => {
  it('passes validation with a valid name only', async () => {
    const dto = plainToInstance(CreateBandDto, { name: 'Los Deltonos' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with all optional fields set', async () => {
    const dto = plainToInstance(CreateBandDto, {
      name: 'Los Deltonos',
      description: 'Rock de Cantabria',
      genre: 'Rock',
      city: 'Santander',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation with an empty name', async () => {
    const dto = plainToInstance(CreateBandDto, { name: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name shorter than 2 characters', async () => {
    const dto = plainToInstance(CreateBandDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name longer than 150 characters', async () => {
    const dto = plainToInstance(CreateBandDto, { name: 'A'.repeat(151) });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation when name is missing', async () => {
    const dto = plainToInstance(CreateBandDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
