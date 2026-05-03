import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response, Request } from 'express';
import { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interfaces/jwtPayload';
import { UserRole } from 'src/utils/enums/UserRole';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  public async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findUserByEmail(dto.email);

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      expiresIn:
        this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  public logout(res: Response) {
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    return { message: 'Logout realizado com sucesso' };
  }

  public async me(userId: string) {
    return this.usersService.findUserById(userId);
  }

  public async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) throw new UnauthorizedException('Refresh token não encontrado');

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      });

      const user = await this.usersService.findUserById(payload.sub);

      if (!user) throw new UnauthorizedException('Usuário não encontrado');

      const newPayload: Omit<JwtPayload, 'exp' | 'iat'> = {
        sub: user.id as string,
        email: user.email as string,
        role: user.role as UserRole,
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
        expiresIn:
          this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      });

      this.setRefreshTokenCookie(res, newRefreshToken);

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  public async register(dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
