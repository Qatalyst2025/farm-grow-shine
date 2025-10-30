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
import { BuyerService } from './buyer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Post()
  create(@Body() dto: CreateBuyerDto) {
    return this.buyerService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUYER')
  @Get('me')
  findMe(@Req() req) {
    return this.buyerService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUYER')
  @Patch('me')
  update(@Req() req, @Body() dto: UpdateBuyerDto) {
    return this.buyerService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUYER')
  @Delete('me')
  remove(@Req() req) {
    return this.buyerService.remove(req.user.id);
  }
}

