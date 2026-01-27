import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../../shareds/entities';
import { CourseService } from './course.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly courseService: CourseService,
  ) {}

  async enrollUser(
    userId: string,
    courseId: string,
  ): Promise<{ success: boolean; message: string; enrollmentId?: string }> {
    // Check if course exists
    const courseExists = await this.courseService.exists(courseId);
    if (!courseExists) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictException('You are already enrolled in this course');
      }
      // Reactivate if previously suspended
      existingEnrollment.status = EnrollmentStatus.ACTIVE;
      existingEnrollment.lastAccessedAt = new Date();
      await this.enrollmentRepository.save(existingEnrollment);

      return {
        success: true,
        message: 'Successfully re-enrolled in the course',
        enrollmentId: existingEnrollment.id,
      };
    }

    // Create new enrollment
    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
      progress: 0,
      lastAccessedAt: new Date(),
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // TODO: Increment enrollment count in Course entity (can be done via event/transaction)
    // For now, we'll do it directly
    await this.updateEnrollmentCount(courseId);

    return {
      success: true,
      message: 'Successfully enrolled in the course',
      enrollmentId: savedEnrollment.id,
    };
  }

  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    return !!enrollment;
  }

  private async updateEnrollmentCount(courseId: string): Promise<void> {
    // Use raw query for atomic increment
    await this.enrollmentRepository.query(
      `UPDATE courses SET "enrollmentCount" = "enrollmentCount" + 1 WHERE id = $1`,
      [courseId],
    );
  }
}
