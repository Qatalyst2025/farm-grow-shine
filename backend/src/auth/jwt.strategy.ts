import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'replace_this_in_prod',
    });
  }

  async validate(payload: any) {
    // payload: { sub, walletAddress, role }
    return { id: payload.sub, email: payload.walletAddress, role: payload.role.toUpperCase() };
  }
}
