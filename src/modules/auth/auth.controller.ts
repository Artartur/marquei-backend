import { Body, Controller, Get, Post, Request, Response } from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { AuthenticatedUser } from 'src/interfaces/authenticatedUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  public login(
    @Body() dto: LoginDto,
    @Response({ passthrough: true }) res: Res,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  logout(@Response({ passthrough: true }) res: Res) {
    return this.authService.logout(res);
  }

  @Public()
  @Post('refresh')
  refresh(@Request() req: Req, @Response({ passthrough: true }) res: Res) {
    return this.authService.refresh(req, res);
  }

  @Post('sign-up')
  @Public()
  public register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  public me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
