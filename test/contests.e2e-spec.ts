import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase } from './utils/db-cleanup';

describe('Contests E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const owner = {
    name: 'Contest Owner',
    email: 'contest-owner@test.com',
    password: 'password123',
  };

  const member = {
    name: 'Contest Member',
    email: 'contest-member@test.com',
    password: 'password123',
  };

  const outsider = {
    name: 'Contest Outsider',
    email: 'contest-outsider@test.com',
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

    return loginResponse.body.accessToken as string;
  }

  async function createOrganization(token: string) {
    const response = await request(app.getHttpServer())
      .post('/api/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Festival de Música de Coruña' })
      .expect(201);

    return response.body.id as string;
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

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/organizations/:organizationId/contests', () => {
    it('should create a contest with default DRAFT status and JURY mode', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      const response = await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: 'Batalla de Bandas',
          status: 'DRAFT',
          votingMode: 'JURY',
          organizationId,
        }),
      );
      expect(response.body.id).toBeDefined();
    });

    it('should create a contest with all optional fields', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      const payload = {
        name: 'Batalla de Bandas',
        description: 'Concurso de rock en Coruña',
        posterUrl: 'https://example.com/poster.jpg',
        latitude: 43.37,
        longitude: -8.4,
        startsAt: '2026-10-01T10:00:00.000Z',
        endsAt: '2026-10-02T22:00:00.000Z',
        registrationDeadline: '2026-09-15T00:00:00.000Z',
        rules: 'Bases del concurso',
        votingMode: 'MIXED',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: payload.name,
          description: payload.description,
          posterUrl: payload.posterUrl,
          latitude: payload.latitude,
          longitude: payload.longitude,
          rules: payload.rules,
          votingMode: 'MIXED',
        }),
      );
      expect(new Date(response.body.startsAt).toISOString()).toBe(
        payload.startsAt,
      );
      expect(new Date(response.body.endsAt).toISOString()).toBe(payload.endsAt);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations/org-1/contests')
        .send({ name: 'Batalla de Bandas' })
        .expect(401);
    });

    it('should return 404 for a non-existing organization', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .post(
          '/api/organizations/00000000-0000-0000-0000-000000000000/contests',
        )
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(404);
    });

    it('should return 403 for a user that is not a member', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      const organizationId = await createOrganization(token);

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(403);
    });

    it('should return 403 for a member with role MEMBER', async () => {
      const token = await createUserAndGetToken(owner);
      const memberToken = await createUserAndGetToken(member);
      const organizationId = await createOrganization(token);

      const memberUser = await prisma.user.findUnique({
        where: { email: member.email },
      });

      await prisma.organizationUser.create({
        data: {
          userId: memberUser!.id,
          organizationId,
          role: 'MEMBER',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(403);
    });

    it('should return 400 for invalid data', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          votingMode: 'UNKNOWN',
          posterUrl: 'not-a-url',
          latitude: 200,
        })
        .expect(400);
    });

    it('should return 400 when endsAt is before startsAt', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Batalla de Bandas',
          startsAt: '2026-10-02T00:00:00.000Z',
          endsAt: '2026-10-01T00:00:00.000Z',
        })
        .expect(400);
    });
  });

  describe('GET /api/organizations/:organizationId/contests', () => {
    it('should list the contests of the organization for a member', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Concurso de Pop' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((c: { name: string }) => c.name)).toEqual(
        expect.arrayContaining(['Batalla de Bandas', 'Concurso de Pop']),
      );
    });

    it('should return 403 for a non-member', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      const organizationId = await createOrganization(token);

      await request(app.getHttpServer())
        .get(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });
  });

  describe('GET /api/contests/:id', () => {
    it('should return an existing contest for a member of its organization', async () => {
      const token = await createUserAndGetToken(owner);
      const organizationId = await createOrganization(token);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(201);

      const contestId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/contests/${contestId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: contestId,
          name: 'Batalla de Bandas',
          organizationId,
        }),
      );
    });

    it('should return 404 for a non-existing contest', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .get('/api/contests/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 for a non-member of the contest organization', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      const organizationId = await createOrganization(token);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/organizations/${organizationId}/contests`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Batalla de Bandas' })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/contests/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });
  });
});
