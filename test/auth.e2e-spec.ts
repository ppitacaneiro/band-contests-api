import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/db-cleanup';

describe('Auth E2E', () => {
    let app: INestApplication;

    const user = {
        name: 'Auth Test User',
        email: 'auth@test.com',
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule =
        await Test.createTestingModule({
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

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await cleanDatabase();

        await request(app.getHttpServer())
            .post('/api/users')
            .send(user)
            .expect(201);
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(typeof response.body.accessToken).toBe('string');
        expect(response.body.accessToken.length).toBeGreaterThan(0);
        });

        it('should return 401 with invalid password', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: 'wrong-password',
            })
            .expect(401);
        });

        it('should return 401 with non-existing email', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'does-not-exist@test.com',
                password: user.password,
            })
            .expect(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return the authenticated user', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(200);

        const token = loginResponse.body.accessToken;

        const response = await request(app.getHttpServer())
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(user.email);
        expect(response.body).not.toHaveProperty('password');
        });

        it('should return 401 without authentication', async () => {
        await request(app.getHttpServer())
            .get('/api/auth/me')
            .expect(401);
        });

        it('should return 401 with an invalid token', async () => {
        await request(app.getHttpServer())
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
        });
    });
});