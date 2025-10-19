"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const contracts_service_1 = require("./contracts.service");
let ContractsController = class ContractsController {
    contractsService;
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    async deploy() {
        return this.contractsService.deployContract();
    }
    async call(body) {
        return this.contractsService.callContractFunction(body.contractId, body.func, body.params);
    }
    async read(id, func) {
        return this.contractsService.queryContractValue(id, func);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('deploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deploy", null);
__decorate([
    (0, common_1.Post)('call'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "call", null);
__decorate([
    (0, common_1.Get)('read'),
    __param(0, (0, common_1.Query)('contractId')),
    __param(1, (0, common_1.Query)('func')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "read", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map