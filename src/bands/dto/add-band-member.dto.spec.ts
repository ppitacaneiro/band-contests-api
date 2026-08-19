import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddBandMemberDto } from './add-band-member.dto';

describe('AddBandMemberDto', () => {
  const uuid = '8745176e-afe4-426b-b1f8-1f7d2a4cafb3';

  it('passes validation with a valid userId', async () => {
    const dto = plainToInstance(AddBandMemberDto, { userId: uuid });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with a role', async () => {
    const dto = plainToInstance(AddBandMemberDto, {
      userId: uuid,
      role: 'MANAGER',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when userId is missing', async () => {
    const dto = plainToInstance(AddBandMemberDto, {});

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('fails validation with a non-uuid userId', async () => {
    const dto = plainToInstance(AddBandMemberDto, { userId: 'not-a-uuid' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('fails validation with an invalid role', async () => {
    const dto = plainToInstance(AddBandMemberDto, {
      userId: uuid,
      role: 'UNKNOWN',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });
});
