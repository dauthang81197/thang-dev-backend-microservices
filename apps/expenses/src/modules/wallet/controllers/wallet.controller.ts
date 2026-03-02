import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WalletService } from '../wallet.service';

@Controller()
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @MessagePattern('expenses.wallets.create')
    async create(@Payload() data: { userId: string; dto: any }) {
        return this.walletService.create(data.userId, data.dto);
    }

    @MessagePattern('expenses.wallets.findAll')
    async findAll(@Payload() data: { userId: string }) {
        return this.walletService.findAllByUser(data.userId);
    }

    @MessagePattern('expenses.wallets.findOne')
    async findOne(@Payload() data: { id: string; userId: string }) {
        return this.walletService.findOneByUser(data.id, data.userId);
    }

    @MessagePattern('expenses.wallets.update')
    async update(@Payload() data: { id: string; userId: string; dto: any }) {
        return this.walletService.update(data.id, data.userId, data.dto);
    }

    @MessagePattern('expenses.wallets.delete')
    async delete(@Payload() data: { id: string; userId: string }) {
        return this.walletService.delete(data.id, data.userId);
    }

    @MessagePattern('expenses.wallets.summary')
    async getSummary(@Payload() data: { userId: string }) {
        return this.walletService.getSummary(data.userId);
    }
}
