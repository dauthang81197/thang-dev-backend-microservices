import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity, WalletType } from '../../shareds/entities/expenses/wallet.entity';
import { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);

    constructor(
        @InjectRepository(WalletEntity)
        private readonly walletRepository: Repository<WalletEntity>,
    ) { }

    async create(userId: string, dto: CreateWalletDto): Promise<WalletEntity> {
        const wallet = this.walletRepository.create({
            userId,
            name: dto.name,
            type: dto.type,
            balance: dto.balance || 0,
        });
        return this.walletRepository.save(wallet);
    }

    async findAllByUser(userId: string): Promise<WalletEntity[]> {
        return this.walletRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOneByUser(id: string, userId: string): Promise<WalletEntity> {
        const wallet = await this.walletRepository.findOne({
            where: { id, userId },
        });
        if (!wallet) {
            throw new RpcException({ statusCode: 404, message: 'Wallet not found' });
        }
        return wallet;
    }

    async update(
        id: string,
        userId: string,
        dto: UpdateWalletDto,
    ): Promise<WalletEntity> {
        const wallet = await this.findOneByUser(id, userId);
        Object.assign(wallet, dto);
        return this.walletRepository.save(wallet);
    }

    async delete(id: string, userId: string): Promise<{ message: string }> {
        const wallet = await this.findOneByUser(id, userId);
        await this.walletRepository.remove(wallet);
        return { message: 'Wallet deleted successfully' };
    }

    async getSummary(userId: string) {
        const wallets = await this.findAllByUser(userId);

        let totalAssets = 0;
        let totalLiabilities = 0;

        for (const wallet of wallets) {
            const balance = Number(wallet.balance);
            if (wallet.type === WalletType.CREDIT) {
                // Credit card: negative balance = debt
                if (balance < 0) {
                    totalLiabilities += Math.abs(balance);
                } else {
                    totalAssets += balance;
                }
            } else {
                totalAssets += balance;
            }
        }

        return {
            totalAssets: Number(totalAssets.toFixed(2)),
            totalLiabilities: Number(totalLiabilities.toFixed(2)),
            netWorth: Number((totalAssets - totalLiabilities).toFixed(2)),
        };
    }

    async updateBalance(
        walletId: string,
        amount: number,
        operation: 'add' | 'subtract',
        manager?: Repository<WalletEntity>,
    ): Promise<void> {
        const repo = manager || this.walletRepository;
        if (operation === 'add') {
            await repo
                .createQueryBuilder()
                .update(WalletEntity)
                .set({ balance: () => `balance + ${amount}` })
                .where('id = :id', { id: walletId })
                .execute();
        } else {
            await repo
                .createQueryBuilder()
                .update(WalletEntity)
                .set({ balance: () => `balance - ${amount}` })
                .where('id = :id', { id: walletId })
                .execute();
        }
    }
}
