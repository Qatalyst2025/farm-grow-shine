import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FarmerService } from './farmer.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';

@Controller('farmer')
export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}

  @Post()
  create(@Body() dto: CreateFarmerDto) {
    return this.farmerService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Get('me')
  findMe(@Req() req) {
    return this.farmerService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Patch('me')
  update(@Req() req, @Body() dto: UpdateFarmerDto) {
    return this.farmerService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Delete('me')
  remove(@Req() req) {
    return this.farmerService.remove(req.user.id);
  }
}

