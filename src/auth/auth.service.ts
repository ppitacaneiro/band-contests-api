import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        const user = await this.usersRepository.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(loginDto.password,user.password);

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN,
        };
    }
}