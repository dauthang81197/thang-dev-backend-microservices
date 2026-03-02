import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
} from '../../shareds/entities/expenses/transaction.entity';
import { WalletEntity } from '../../shareds/entities/expenses/wallet.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
} from './dto/transaction.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify wallet belongs to user
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: dto.walletId, userId },
      });
      if (!wallet) {
        throw new RpcException({
          statusCode: 404,
          message: 'Wallet not found',
        });
      }

      // Create transaction
      const transaction = queryRunner.manager.create(TransactionEntity, {
        userId,
        walletId: dto.walletId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : new Date(),
      });

      const saved = await queryRunner.manager.save(transaction);

      // Update wallet balance
      if (dto.type === TransactionType.INCOME) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance + ${dto.amount}` })
          .where('id = :id', { id: dto.walletId })
          .execute();
      } else if (dto.type === TransactionType.EXPENSE) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance - ${dto.amount}` })
          .where('id = :id', { id: dto.walletId })
          .execute();
      }

      await queryRunner.commitTransaction();

      // Return with relations
      return this.transactionRepository.findOne({
        where: { id: saved.id },
        relations: ['wallet', 'category'],
      }) as Promise<TransactionEntity>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string, filter: FilterTransactionDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (filter.type) {
      qb.andWhere('transaction.type = :type', { type: filter.type });
    }

    if (filter.categoryId) {
      qb.andWhere('transaction.categoryId = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    if (filter.walletId) {
      qb.andWhere('transaction.walletId = :walletId', {
        walletId: filter.walletId,
      });
    }

    if (filter.fromDate) {
      qb.andWhere('transaction.transactionDate >= :fromDate', {
        fromDate: filter.fromDate,
      });
    }

    if (filter.toDate) {
      qb.andWhere('transaction.transactionDate <= :toDate', {
        toDate: filter.toDate,
      });
    }

    if (filter.search) {
      qb.andWhere('LOWER(transaction.description) LIKE LOWER(:search)', {
        search: `%${filter.search}%`,
      });
    }

    qb.orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['wallet', 'category'],
    });
    if (!transaction) {
      throw new RpcException({
        statusCode: 404,
        message: 'Transaction not found',
      });
    }
    return transaction;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(TransactionEntity, {
        where: { id, userId },
      });
      if (!existing) {
        throw new RpcException({
          statusCode: 404,
          message: 'Transaction not found',
        });
      }

      // Reverse the old balance change
      if (existing.type === TransactionType.INCOME) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance - ${existing.amount}` })
          .where('id = :id', { id: existing.walletId })
          .execute();
      } else {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance + ${existing.amount}` })
          .where('id = :id', { id: existing.walletId })
          .execute();
      }

      // Apply updates
      const newType = dto.type || existing.type;
      const newAmount =
        dto.amount !== undefined ? dto.amount : Number(existing.amount);
      const newWalletId = dto.walletId || existing.walletId;

      Object.assign(existing, {
        ...dto,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : existing.transactionDate,
      });

      await queryRunner.manager.save(existing);

      // Apply the new balance change to the (possibly new) wallet
      if (newType === TransactionType.INCOME) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance + ${newAmount}` })
          .where('id = :id', { id: newWalletId })
          .execute();
      } else {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance - ${newAmount}` })
          .where('id = :id', { id: newWalletId })
          .execute();
      }

      await queryRunner.commitTransaction();

      return this.transactionRepository.findOne({
        where: { id },
        relations: ['wallet', 'category'],
      }) as Promise<TransactionEntity>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { id, userId },
      });
      if (!transaction) {
        throw new RpcException({
          statusCode: 404,
          message: 'Transaction not found',
        });
      }

      // Reverse wallet balance
      if (transaction.type === TransactionType.INCOME) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance - ${transaction.amount}` })
          .where('id = :id', { id: transaction.walletId })
          .execute();
      } else {
        await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: () => `balance + ${transaction.amount}` })
          .where('id = :id', { id: transaction.walletId })
          .execute();
      }

      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();

      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
