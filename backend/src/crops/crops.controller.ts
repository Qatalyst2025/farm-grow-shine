import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { extname } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Controller('crops')
export class CropsController {
  constructor(private readonly cropService: CropsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Post()
  create(@Body() dto: CreateCropDto) {
    return this.cropService.create(dto);
  }
  
    @Get("my")
  @UseGuards(JwtAuthGuard)
  getMyCrops(@Req() req) {
    return this.cropService.findByFarmer(req.user.userId);
  }

  @Get()
  findAll() {
    return this.cropService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cropService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCropDto) {
    return this.cropService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cropService.remove(id);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @Post(':id/tokenize')
  async tokenize(@Param('id') id: string) {
    return this.cropService.verifyCrop(id);
  }
  
  @Post(":id/photos")
  @UseInterceptors(
    FileInterceptor("photo", {
      storage: diskStorage({
        destination: "./uploads/crop-photos",
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowed = /jpg|jpeg|png|gif/;
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.test(ext)) {
          return callback(
            new BadRequestException("Only image files allowed"),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadPhoto(
    @Param("id") cropId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException("No photo uploaded");
    }

    const photoUrl = `/uploads/crop-photos/${file.filename}`;

    return this.cropService.addPhoto(cropId, photoUrl);
  }

  @Get(":id/photos")
  async getPhotos(@Param("id") cropId: string) {
    return this.cropService.getCropPhotos(cropId);
  }
}
