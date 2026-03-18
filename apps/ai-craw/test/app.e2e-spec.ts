import { Test, TestingModule } from '@nestjs/testing';
import { AiCrawModule } from '../src/ai-craw.module';

describe('AiCraw (e2e)', () => {
  let app: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AiCrawModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
