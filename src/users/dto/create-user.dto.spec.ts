import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('passes validation with valid data', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation with an empty name', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: '',
      email: 'jane@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails validation with an invalid email', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Jane Doe',
      email: 'not-an-email',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails validation with a password shorter than 8 characters', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('fails validation when fields are missing', async () => {
    const dto = plainToInstance(CreateUserDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
