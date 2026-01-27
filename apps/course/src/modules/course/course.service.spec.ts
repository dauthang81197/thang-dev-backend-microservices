import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { Course, CourseStatus, CourseLevel } from '../../shareds/entities';
import { NotFoundException } from '@nestjs/common';

describe('CourseService', () => {
  let service: CourseService;

  const mockCourse: Course = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Course',
    description: 'Test Description',
    category: 'programming',
    level: CourseLevel.BEGINNER,
    price: 29.99,
    thumbnail: '',
    previewVideo: '',
    status: CourseStatus.PUBLISHED,
    instructorId: '123e4567-e89b-12d3-a456-426614174001',
    instructorName: 'John Doe',
    enrollmentCount: 100,
    rating: 4.5,
    reviewCount: 20,
    requirements: [],
    whatYouWillLearn: [],
    tags: [],
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    sections: [],
    enrollments: [],
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCourse], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        courses: [mockCourse],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('course');
    });

    it('should apply filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCourse], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({
        category: 'programming',
        level: CourseLevel.BEGINNER,
        search: 'test',
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCourse),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findOne(mockCourse.id);

      expect(result).toEqual(mockCourse);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('course.id = :id', {
        id: mockCourse.id,
      });
    });

    it('should throw NotFoundException when course not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exists', () => {
    it('should return true if course exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await service.exists(mockCourse.id);

      expect(result).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { id: mockCourse.id, status: CourseStatus.PUBLISHED },
      });
    });

    it('should return false if course does not exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
