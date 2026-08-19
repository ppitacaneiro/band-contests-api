import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { HttpCode, HttpStatus } from '@nestjs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión y obtiene un token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Autenticación correcta, devuelve el token de acceso',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtiene el usuario autenticado a partir del token JWT',
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  getMe(@Req() request: any) {
    return request.user;
  }
}
