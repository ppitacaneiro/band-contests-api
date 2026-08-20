import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/db-cleanup';

describe('Organizations E2E', () => {
  let app: INestApplication;

  const owner = {
    name: 'Org Owner',
    email: 'org-owner@test.com',
    password: 'password123',
  };

  const outsider = {
    name: 'Org Outsider',
    email: 'org-outsider@test.com',
    password: 'password123',
  };

  async function createUserAndGetToken(user: typeof owner) {
    await request(app.getHttpServer())
      .post('/api/users')
      .send(user)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    return (loginResponse.body as { accessToken: string }).accessToken;
  }

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

  describe('GET /api/organizations/:id', () => {
    it('should return the organization to a member', async () => {
      const token = await createUserAndGetToken(owner);

      const createResponse = await request(app.getHttpServer())
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rock Coruña' })
        .expect(201);

      const { id: organizationId } = createResponse.body as { id: string };

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: organizationId,
          name: 'Rock Coruña',
        }),
      );
    });

    it('should return 403 for a user that is not a member', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);

      const createResponse = await request(app.getHttpServer())
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rock Coruña' })
        .expect(201);

      const { id: organizationId } = createResponse.body as { id: string };

      await request(app.getHttpServer())
        .get(`/api/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/organizations/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return 404 for a non-existing organization', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .get('/api/organizations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
