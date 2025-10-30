import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DbService } from '../db/db.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'replace_this_in_prod',
      signOptions: { 
        expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : '7d' 
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DbService],
  exports: [AuthService],
})
export class AuthModule {}
