import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { ContractsService } from '../contracts/contracts.service';
import { crops, users, cropPhotos } from '../db/schema';
import { TokenService } from '../token/token.service';
import { eq } from 'drizzle-orm';
import { UpdateCropDto } from './dto/update-crop.dto';

@Injectable()
export class CropsService {
  private readonly logger = new Logger(CropsService.name);
  constructor(
    private readonly db: DbService,
    private readonly blockchain: ContractsService,
    private readonly tokenService: TokenService,
  ) {}

  async create(dto: CreateCropDto) {
  // 1️⃣ Check if user exists FIRST (before any inserts)
  let farmer = await this.db.db
    .select()
    .from(users)
    .where(eq(users.id, dto.farmerId))
    .then(res => res[0]);

  // 2️⃣ Create user if doesn't exist (using correct schema fields)
  if (!farmer) {
    [farmer] = await this.db.db
      .insert(users)
      .values({
        id: dto.farmerId,
        walletAddress: `auto-generated-${dto.farmerId}`, // Use walletAddress from your schema
      })
      .returning();
    console.log('👨‍🌾 Auto-created farmer:', farmer.id);
  }

  // 3️⃣ Deploy contract
  const contract = await this.blockchain.deployContract();

  // 4️⃣ Prepare crop data
  const cropData = {
    farmerId: dto.farmerId,
    name: dto.name,
    type: dto.type,
    contractId: contract.contractId,
    onChainVerified: true,
    ...(dto.expectedHarvestDate && { 
      expectedHarvestDate: new Date(dto.expectedHarvestDate) 
    }),
  };

  // 5️⃣ Create crop
  const [newCrop] = await this.db.db
    .insert(crops)
    .values(cropData)
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
  
  async verifyCrop(cropId: string) {
  const crop = await this.db.db.query.crops.findFirst({ 
    where: eq(crops.id, cropId) 
  });

  if (!crop) throw new Error('Crop not found');

  const { tokenId, supplyKey } = await this.tokenService.createCollection('FarmNFT', 'FARM');
  
  const serial = await this.tokenService.mintNFT(
    tokenId, 
    {
      name: crop.name,
      type: crop.type,
    },
    supplyKey
  );

  await this.db.db.update(crops)
    .set({ tokenId, tokenSerial: serial })
    .where(eq(crops.id, cropId));

  return { 
    ...crop, 
    tokenId, 
    tokenSerial: serial,
    message: 'Crop verified and NFT minted successfully! 🌿'
  };
}

  async handleChainSync(event: any) {
  const { cropId, stage, progress, health } = event;

  await this.db.db.update(crops)
    .set({
      stage,
      progress,
      health,
      updatedAt: new Date()
    })
    .where(eq(crops.id, cropId));

  this.logger.log(`✅ Crop ${cropId} synced from chain.`);
}

  async findByFarmer(farmerId: string) {
    return this.db.db.query.crops.findMany({
      where: eq(crops.farmerId, farmerId),
    });
  }
  
  async addPhoto(cropId: string, photoUrl: string, milestone?: string) {
  // Verify crop exists
    const crop = await this.db.db.query.crops.findFirst({
      where: eq(crops.id, cropId),
    });

    if (!crop) {
      throw new Error("Crop not found");
    }

    const [newPhoto] = await this.db.db
      .insert(cropPhotos)
      .values({
        cropId,
        url: photoUrl,
        milestone: milestone || crop.stage || "Unspecified",
      })
      .returning();

    return {
      message: "Photo uploaded successfully",
      photo: newPhoto,
    };
  }

  async getCropPhotos(cropId: string) {
    return await this.db.db.query.cropPhotos.findMany({
      where: eq(cropPhotos.cropId, cropId),
      orderBy: (photos, {asc}) => [asc(photos.createdAt)],
    });
  }
}
