import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('passes validation with a valid email and password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation with an invalid email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'not-an-email',
      password: 'password123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails validation with a password shorter than 8 characters', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('fails validation when fields are missing', async () => {
    const dto = plainToInstance(LoginDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
