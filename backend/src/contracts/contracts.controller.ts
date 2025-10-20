import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('deploy')
  async deploy() {
    return this.contractsService.deployContract();
  }

  @Post('call')
  async call(
    @Body() body: { contractId: string; func: string; params: any[] },
  ) {
    return this.contractsService.callContractFunction(
      body.contractId,
      body.func,
      body.params,
    );
  }

  @Get('read')
  async read(@Query('contractId') id: string, @Query('func') func: string) {
    return this.contractsService.queryContractValue(id, func);
  }
  
  @Get("verify")
  async verifyContract(@Query("contractId") contractId: string) {
    return this.contractsService.verifyContract(contractId);
  }
}
