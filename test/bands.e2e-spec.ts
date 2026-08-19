import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase } from './utils/db-cleanup';

describe('Bands E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const owner = {
    name: 'Band Owner',
    email: 'band-owner@test.com',
    password: 'password123',
  };

  const member = {
    name: 'Band Member',
    email: 'band-member@test.com',
    password: 'password123',
  };

  const outsider = {
    name: 'Band Outsider',
    email: 'band-outsider@test.com',
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

  async function createBand(token: string, name = 'Los Deltonos') {
    const response = await request(app.getHttpServer())
      .post('/api/bands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name })
      .expect(201);

    return response.body.id as string;
  }

  async function getUserIdByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user!.id;
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

  describe('POST /api/bands', () => {
    it('should create a band with the creator as OWNER member', async () => {
      const token = await createUserAndGetToken(owner);

      const response = await request(app.getHttpServer())
        .post('/api/bands')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Los Deltonos' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: 'Los Deltonos',
        }),
      );
      expect(response.body.id).toBeDefined();
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0]).toEqual(
        expect.objectContaining({
          userId: expect.any(String),
          role: 'OWNER',
        }),
      );
    });

    it('should create a band with all optional fields', async () => {
      const token = await createUserAndGetToken(owner);

      const payload = {
        name: 'Los Deltonos',
        description: 'Rock de Cantabria',
        genre: 'Rock',
        city: 'Santander',
      };

      const response = await request(app.getHttpServer())
        .post('/api/bands')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          name: payload.name,
          description: payload.description,
          genre: payload.genre,
          city: payload.city,
        }),
      );
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/bands')
        .send({ name: 'Los Deltonos' })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .post('/api/bands')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /api/bands', () => {
    it('should list only the bands of the authenticated user', async () => {
      const ownerToken = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);

      await createBand(ownerToken, 'Los Deltonos');
      await createBand(ownerToken, 'Marea');
      await createBand(outsiderToken, 'Extremoduro');

      const response = await request(app.getHttpServer())
        .get('/api/bands')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((b: { name: string }) => b.name)).toEqual(
        expect.arrayContaining(['Los Deltonos', 'Marea']),
      );
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/api/bands').expect(401);
    });
  });

  describe('GET /api/bands/:id', () => {
    it('should return an existing band for a member', async () => {
      const token = await createUserAndGetToken(owner);
      const bandId = await createBand(token);

      const response = await request(app.getHttpServer())
        .get(`/api/bands/${bandId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: bandId,
          name: 'Los Deltonos',
        }),
      );
    });

    it('should return 404 for a non-existing band', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .get('/api/bands/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 for a non-member', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      const bandId = await createBand(token);

      await request(app.getHttpServer())
        .get(`/api/bands/${bandId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/bands/:id', () => {
    it('should update the band for an OWNER', async () => {
      const token = await createUserAndGetToken(owner);
      const bandId = await createBand(token);

      const response = await request(app.getHttpServer())
        .patch(`/api/bands/${bandId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo Nombre', genre: 'Pop' })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: bandId,
          name: 'Nuevo Nombre',
          genre: 'Pop',
        }),
      );
    });

    it('should return 403 for a MANAGER member', async () => {
      const token = await createUserAndGetToken(owner);
      const memberToken = await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId, role: 'MANAGER' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/bands/${bandId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'No Permitido' })
        .expect(403);
    });

    it('should return 404 for a non-existing band', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .patch('/api/bands/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo' })
        .expect(404);
    });
  });

  describe('POST /api/bands/:bandId/members', () => {
    it('should add a member with MANAGER role by default', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      const response = await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          bandId,
          userId: memberId,
          role: 'MANAGER',
        }),
      );
    });

    it('should add a member with an explicit role', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      const response = await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId, role: 'OWNER' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          userId: memberId,
          role: 'OWNER',
        }),
      );
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/bands/band-1/members')
        .send({ userId: 'user-2' })
        .expect(401);
    });

    it('should return 403 for a non-member actor', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ userId: memberId })
        .expect(403);
    });

    it('should return 404 when the band does not exist', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post('/api/bands/00000000-0000-0000-0000-000000000000/members')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(404);
    });

    it('should return 404 when the target user does not exist', async () => {
      const token = await createUserAndGetToken(owner);
      const bandId = await createBand(token);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should return 409 when the user is already a member', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(409);
    });

    it('should return 400 for invalid data', async () => {
      const token = await createUserAndGetToken(owner);
      const bandId = await createBand(token);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'not-a-uuid' })
        .expect(400);
    });
  });

  describe('GET /api/bands/:bandId/members', () => {
    it('should list the members for a member of the band', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((m: { role: string }) => m.role)).toEqual(
        expect.arrayContaining(['OWNER', 'MANAGER']),
      );
    });

    it('should return 403 for a non-member', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      const bandId = await createBand(token);

      await request(app.getHttpServer())
        .get(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });

    it('should return 404 for a non-existing band', async () => {
      const token = await createUserAndGetToken(owner);

      await request(app.getHttpServer())
        .get('/api/bands/00000000-0000-0000-0000-000000000000/members')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('DELETE /api/bands/:bandId/members/:userId', () => {
    it('should remove a MANAGER member for an OWNER actor', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .post(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: memberId })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/bands/${bandId}/members/${memberId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const membersResponse = await request(app.getHttpServer())
        .get(`/api/bands/${bandId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(1);
    });

    it('should return 400 when trying to remove the last owner', async () => {
      const token = await createUserAndGetToken(owner);
      const bandId = await createBand(token);
      const ownerId = await getUserIdByEmail(owner.email);

      await request(app.getHttpServer())
        .delete(`/api/bands/${bandId}/members/${ownerId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should return 404 when the target is not a member', async () => {
      const token = await createUserAndGetToken(owner);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .delete(`/api/bands/${bandId}/members/${memberId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 for a non-member actor', async () => {
      const token = await createUserAndGetToken(owner);
      const outsiderToken = await createUserAndGetToken(outsider);
      await createUserAndGetToken(member);
      const bandId = await createBand(token);
      const memberId = await getUserIdByEmail(member.email);

      await request(app.getHttpServer())
        .delete(`/api/bands/${bandId}/members/${memberId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
    });
  });
});