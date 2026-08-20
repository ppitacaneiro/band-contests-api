process.env.THROTTLE_LOGIN_LIMIT = '3';
process.env.THROTTLE_LOGIN_TTL_MS = '60000';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/db-cleanup';

describe('Rate limiting E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should return 429 after exceeding the login rate limit', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Rate Test',
          email: 'rate@test.com',
          password: 'password123',
        })
        .expect(201);

      for (let i = 0; i < 3; i += 1) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'rate@test.com', password: 'wrong-password' })
          .expect(401);
      }

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'rate@test.com', password: 'wrong-password' })
        .expect(429);
    });
  });
});
