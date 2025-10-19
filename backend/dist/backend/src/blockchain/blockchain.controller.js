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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("./blockchain.service");
const db_service_1 = require("../db/db.service");
const schema_1 = require("../db/schema");
let BlockchainController = class BlockchainController {
    blockchainService;
    db;
    constructor(blockchainService, db) {
        this.blockchainService = blockchainService;
        this.db = db;
    }
    async getStatus() {
        return this.blockchainService.getBalance();
    }
    async test() {
        const allUsers = await this.db.db.select().from(schema_1.users);
        return allUsers;
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "test", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        db_service_1.DbService])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map