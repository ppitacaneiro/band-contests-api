import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrganizationDto } from './create-organization.dto';

describe('CreateOrganizationDto', () => {
  it('passes validation with a valid name', async () => {
    const dto = plainToInstance(CreateOrganizationDto, { name: 'Rock Coruña' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation with an empty name', async () => {
    const dto = plainToInstance(CreateOrganizationDto, { name: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name shorter than 2 characters', async () => {
    const dto = plainToInstance(CreateOrganizationDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name longer than 100 characters', async () => {
    const dto = plainToInstance(CreateOrganizationDto, {
      name: 'A'.repeat(101),
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation when name is missing', async () => {
    const dto = plainToInstance(CreateOrganizationDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
