import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContestDto } from './create-contest.dto';

describe('CreateContestDto', () => {
  it('passes validation with a valid name only', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'Batalla de Bandas',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with all optional fields set', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'Batalla de Bandas',
      description: 'Concurso de rock',
      posterUrl: 'https://example.com/poster.jpg',
      latitude: 43.37,
      longitude: -8.4,
      startsAt: '2026-10-01T10:00:00.000Z',
      endsAt: '2026-10-02T22:00:00.000Z',
      registrationDeadline: '2026-09-15T00:00:00.000Z',
      rules: 'Bases del concurso',
      votingMode: 'MIXED',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation with an empty name', async () => {
    const dto = plainToInstance(CreateContestDto, { name: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name shorter than 2 characters', async () => {
    const dto = plainToInstance(CreateContestDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with a name longer than 150 characters', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'A'.repeat(151),
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation when name is missing', async () => {
    const dto = plainToInstance(CreateContestDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails validation with an invalid posterUrl', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'Concurso',
      posterUrl: 'not-a-url',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'posterUrl')).toBe(true);
  });

  it('fails validation with an out-of-range latitude', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'Concurso',
      latitude: 200,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'latitude')).toBe(true);
  });

  it('fails validation with an invalid votingMode', async () => {
    const dto = plainToInstance(CreateContestDto, {
      name: 'Concurso',
      votingMode: 'UNKNOWN',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'votingMode')).toBe(true);
  });
});
