import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // request a challenge for a wallet
  @Public()
  @Get('challenge')
  async challenge(@Query('wallet') wallet: string) {
    if (!wallet) throw new Error('Missing wallet query param');
    return this.auth.getChallenge(wallet.toLowerCase());
  }

  // verify signature, returns JWT
  @Public()
  @Post('verify')
  async verify(
    @Body() body: { wallet: string; signature: string; publicKey?: string },
  ) {
    const { wallet, signature, publicKey } = body;
    return this.auth.verifyChallenge(wallet.toLowerCase(), signature, publicKey);
  }
  
  @Post('register')
  @Public()
  async register(
    @Body() body: { email: string; password: string; name: string; role?: string },
  ) {
    console.log('📨 [AuthController] Register request received');
    console.log('📦 [AuthController] Request body:', body);
  
    try {
      const { email, password, name, role } = body;
      const result = await this.auth.register(email, password, name, role);
      console.log('✅ [AuthController] Register successful');
      return result;
    } catch (error) {
      console.error('❌ [AuthController] Register failed:', error);
      // Re-throw to maintain the original error
      throw error;
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ) {
    console.log('📨 [AuthController] Login request received');
    console.log('📦 [AuthController] Request body:', { email: body.email });
  
    try {
      const { email, password } = body;
      const result = await this.auth.login(email, password);
      console.log('✅ [AuthController] Login successful');
      return result;
    } catch (error) {
      console.error('❌ [AuthController] Login failed:', error);
      throw error;
    }
  }
  
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.auth.getProfile(req.user.sub);
  }
  
  @Public()
  @Post('public-test')
  publicTest(@Body() body: any) {
    console.log('✅ [AuthController] Public test endpoint called');
    console.log('📦 Body received:', body);
    return { 
      message: 'Public endpoint is working!', 
      body: body,
      timestamp: new Date().toISOString()
    };
  }
}

