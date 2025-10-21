import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('deploy')
  async deploy() {
    return this.contractsService.deployContract();
  }

  /**
   * Call a smart contract function (state-changing)
   */
  @Post('call')
  async call(
    @Body() body: { contractId?: string; func?: string; params?: any[] },
  ) {
    console.log('📩 Incoming call body:', body);

    // 🧩 Basic validation to prevent undefined errors
    if (!body || !body.contractId || !body.func) {
      throw new BadRequestException(
        'Request body must include { contractId, func, params? }',
      );
    }

    return this.contractsService.callContractFunction(
      body.contractId,
      body.func,
      body.params ?? [],
    );
  }

  /**
   * Query a contract view function (read-only)
   */
  @Get('read')
  async read(
    @Query('contractId') contractId: string,
    @Query('func') func: string,
    @Query('params') params?: string,
  ) {
    if (!contractId || !func) {
      throw new BadRequestException(
        'Query must include contractId and func parameters',
      );
    }

    // Parse params if provided (as comma-separated values)
    const parsedParams = params ? params.split(',').map((p) => p.trim()) : [];

    return this.contractsService.queryContractValue(
      contractId,
      func,
      parsedParams,
    );
  }

  /**
   * Verify if the deployed bytecode matches the local Foundry artifact
   */
  @Get('verify')
  async verifyContract(@Query('contractId') contractId: string) {
    if (!contractId) {
      throw new BadRequestException('Missing contractId');
    }

    return this.contractsService.verifyContract(contractId);
  }
}
