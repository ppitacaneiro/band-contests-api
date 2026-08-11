import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/db-cleanup';

describe('Users E2E', () => {
    let app: INestApplication;

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

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/users', () => {
        it('should create a user', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users')
            .send({
            name: 'Carlos',
            email: 'carlos@example.com',
            password: 'Password123!',
            })
            .expect(201);

        expect(response.body).toEqual(
            expect.objectContaining({
            name: 'Carlos',
            email: 'carlos@example.com',
            }),
        );

        expect(response.body.password).toBeUndefined();
        expect(response.body.id).toBeDefined();
        });

        it('should return 409 when email already exists', async () => {
        const user = {
            name: 'Carlos',
            email: 'carlos@example.com',
            password: 'Password123!',
        };

        await request(app.getHttpServer())
            .post('/api/users')
            .send(user)
            .expect(201);

        await request(app.getHttpServer())
            .post('/api/users')
            .send(user)
            .expect(409);
        });

        it('should return 400 for invalid data', async () => {
        await request(app.getHttpServer())
            .post('/api/users')
            .send({
            name: '',
            email: 'not-an-email',
            password: '123',
            })
            .expect(400);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return an existing user', async () => {
        const createResponse = await request(app.getHttpServer())
            .post('/api/users')
            .send({
            name: 'Carlos',
            email: 'carlos@example.com',
            password: 'Password123!',
            })
            .expect(201);

        const userId = createResponse.body.id;

        const response = await request(app.getHttpServer())
            .get(`/api/users/${userId}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
            id: userId,
            name: 'Carlos',
            email: 'carlos@example.com',
            }),
        );

        expect(response.body.password).toBeUndefined();
        });

        it('should return 404 for a non-existing user', async () => {
        await request(app.getHttpServer())
            .get('/api/users/00000000-0000-0000-0000-000000000000')
            .expect(404);
        });
    });
});