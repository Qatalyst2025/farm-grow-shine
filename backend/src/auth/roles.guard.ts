import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('🔐 [RolesGuard] Starting role check...');
    
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔐 [RolesGuard] Required roles:', requiredRoles);
    
    if (!requiredRoles) {
      console.log('🔐 [RolesGuard] No roles required, allowing access');
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    console.log('🔐 [RolesGuard] User object:', user);
    console.log('🔐 [RolesGuard] User role:', user?.role);
    
    if (!user) {
      console.log('❌ [RolesGuard] No user found in request');
      return false;
    }

    console.log('🔐 [RolesGuard] Role check:', {
      userRole: user.role,
      requiredRoles,
      match: requiredRoles.includes(user.role)
    });
    
    const hasAccess = requiredRoles.includes(user.role);
    console.log('🔐 [RolesGuard] Access granted:', hasAccess);
    
    return hasAccess;
  }
}
