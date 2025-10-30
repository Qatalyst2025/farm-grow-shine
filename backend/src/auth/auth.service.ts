import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { DbService } from '../db/db.service';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import nacl from 'tweetnacl';
import { encodeUTF8, decodeUTF8, decodeBase64 } from 'tweetnacl-util';

// in-memory challenges map: wallet -> { nonce, expiresAt }
const CHALLENGES = new Map<string, { nonce: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private db: DbService) {}

  // Email/Password Registration
  async register(email: string, password: string, name: string, role?: string) {
    console.log('🔐 [AuthService] Register attempt started');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🎭 Role:', role);
    
    try {
      // Check if user already exists
      console.log('📋 [AuthService] Checking for existing user...');
      const existingUser = await this.db.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      console.log('📊 [AuthService] Existing user result:', existingUser ? 'Found' : 'Not found');

      if (existingUser) {
        console.log('❌ [AuthService] User already exists with wallet/email:', email);
        throw new ConflictException('User already exists with this email');
      }

      // Hash password
      console.log('🔒 [AuthService] Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('✅ [AuthService] Password hashed successfully');

      // Create user
      console.log('👤 [AuthService] Creating user in database...');
      const userData = {
        walletAddress: email,
        email: email,
        password: hashedPassword,
        name: name,
        role: role || 'farmer',
      };
      console.log('📝 [AuthService] User data to insert:', userData);

      const [newUser] = await this.db.db.insert(users).values(userData).returning();
      console.log('✅ [AuthService] User created successfully:', newUser.id);

      // Generate JWT token
      console.log('🎫 [AuthService] Generating JWT token...');
      const payload = {
        sub: newUser.id,
        walletAddress: newUser.walletAddress,
        email: newUser.email,
        role: (newUser.role || 'farmer').toUpperCase(), // Fix: Handle possible null
      };
      
      const token = this.jwt.sign(payload);
      console.log('✅ [AuthService] JWT token generated');

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      console.log('🎉 [AuthService] Registration completed successfully');
      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('❌ [AuthService] Registration ERROR:', error);
      console.error('❌ [AuthService] Error message:', error.message);
      console.error('❌ [AuthService] Error stack:', error.stack);
      throw error;
    }
  }

  // Login method
  async login(email: string, password: string) {
    console.log('🔐 [AuthService] Login attempt for email:', email);
    
    try {
      // Find user by email (using walletAddress field)
      console.log('📋 [AuthService] Finding user...');
      const user = await this.db.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        console.log('❌ [AuthService] User not found for email:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('✅ [AuthService] User found:', { id: user.id, email: user.email });

      // Check if user has a password (email/password user)
      if (!user.password) {
        console.log('❌ [AuthService] User has no password set');
        throw new UnauthorizedException('Please use wallet authentication for this account');
      }

      // Verify password
      console.log('🔑 [AuthService] Verifying password...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔑 [AuthService] Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ [AuthService] Invalid password for user:', user.id);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      console.log('🎫 [AuthService] Generating JWT token for login...');
      const payload = {
        sub: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        role: (user.role || 'farmer').toUpperCase(), // Fix: Handle possible null
      };

      const token = this.jwt.sign(payload);
      console.log('✅ [AuthService] JWT token generated for login');

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log('🎉 [AuthService] Login completed successfully for user:', user.id);
      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('❌ [AuthService] Login ERROR:', error);
      console.error('❌ [AuthService] Login error message:', error.message);
      console.error('❌ [AuthService] Login error stack:', error.stack);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.db.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  // Existing wallet authentication methods
  getChallenge(wallet: string) {
    const nonce = `Sign this nonce to authenticate: ${randomBytes(16).toString('hex')}`;
    const expiresAt = Date.now() + 1000 * 60 * 3; // 3 minutes
    CHALLENGES.set(wallet, { nonce, expiresAt });
    return { wallet, nonce, expiresAt };
  }

  // helper: remove expired
  private clearExpired() {
    const now = Date.now();
    for (const [w, val] of CHALLENGES.entries()) {
      if (val.expiresAt < now) CHALLENGES.delete(w);
    }
  }

  async verifyChallenge(wallet: string, signature: string, publicKey?: string) {
    this.clearExpired();
    const challenge = CHALLENGES.get(wallet);
    if (!challenge) throw new UnauthorizedException('No valid challenge found or expired');

    const message = challenge.nonce;

    const verified = await this.verifySignature(wallet, message, signature, publicKey);
    if (!verified) throw new UnauthorizedException('Invalid signature');

    // signature valid -> find or create user
    let dbUser = await this.db.db.query.users.findFirst({ where: eq(users.walletAddress, wallet) });
    if (!dbUser) {
      const [newUser] = await this.db.db.insert(users).values({
        walletAddress: wallet,
        role: 'farmer',
      }).returning();
      dbUser = newUser;
    }

    // issue jwt
    const payload = {
      sub: dbUser.id,
      walletAddress: dbUser.walletAddress,
      email: dbUser.email,
      role: (dbUser.role || 'farmer').toUpperCase(), // Fix: Handle possible null
    };
    const token = this.jwt.sign(payload);

    // cleanup challenge
    CHALLENGES.delete(wallet);

    return { access_token: token, user: payload };
  }

  async verifySignature(wallet: string, message: string, signature: string, publicKey?: string) {
    try {
      // ECDSA path (recover address)
      if (signature.startsWith('0x')) {
        try {
          // ✅ Fixed: ethers v6 syntax
          const recovered = ethers.verifyMessage(message, signature);
          const normalizedRecovered = recovered.toLowerCase();
          const normalizedWallet = wallet.toLowerCase();
          return normalizedRecovered === normalizedWallet;
        } catch (e) {
          // not valid ECDSA signature
        }
      }

      // ED25519 path
      const sigBuf = this.tryDecode(signature);
      let pubKeyBuf: Uint8Array | null = null;

      if (publicKey) {
        pubKeyBuf = this.tryDecodeToUint8(publicKey);
      } else {
        throw new Error('ED25519 verification requires publicKey to be provided.');
      }

      const ok = nacl.sign.detached.verify(decodeUTF8(message), sigBuf, pubKeyBuf);
      return ok;
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  }

  private tryDecode(input: string): Uint8Array {
    if (input.startsWith('0x')) {
      const hex = input.slice(2);
      return Uint8Array.from(Buffer.from(hex, 'hex'));
    }
    try {
      return decodeBase64(input);
    } catch (e) {
      return decodeUTF8(input);
    }
  }

  private tryDecodeToUint8(input: string): Uint8Array {
    if (input.startsWith('0x')) {
      return Uint8Array.from(Buffer.from(input.slice(2), 'hex'));
    }
    try {
      return decodeBase64(input);
    } catch (e) {
      return decodeUTF8(input);
    }
  }
}

