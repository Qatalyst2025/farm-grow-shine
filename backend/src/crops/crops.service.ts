import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { ContractsService } from '../contracts/contracts.service';
import { crops } from '../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateCropDto } from './dto/update-crop.dto';

@Injectable()
export class CropsService {
  constructor(
    private readonly db: DbService,
    private readonly blockchain: ContractsService,
  ) {}

  async create(dto: CreateCropDto) {
    const contract = await this.blockchain.deployContract();

    const [newCrop] = await this.db.db
      .insert(crops)
      .values({ ...dto, contractId: contract.contractId })
      .returning();

    return {
      message: 'Crop created and contract deployed successfully',
      crop: newCrop,
    };
  }

  async findAll() {
    return await this.db.db.select().from(crops);
  }

  async findOne(id: string) {
    const [crop] = await this.db.db
      .select()
      .from(crops)
      .where(eq(crops.id, id));

    return crop;
  }

  async update(id: string, dto: UpdateCropDto) {
    const [updated] = await this.db.db
      .update(crops)
      .set(dto)
      .where(eq(crops.id, id))
      .returning();

    return { message: 'Crop updated successfully', updated };
  }

  async remove(id: string) {
    await this.db.db.delete(crops).where(eq(crops.id, id));
    return { message: 'Crop deleted successfully' };
  }
}
