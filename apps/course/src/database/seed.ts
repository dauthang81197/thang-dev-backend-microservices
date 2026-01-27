import { DataSource } from 'typeorm';
import {
  Course,
  Section,
  Lesson,
  CourseLevel,
  CourseStatus,
  LessonType,
} from '../shareds/entities';

/**
 * Seed script to populate database with sample course data
 * Run: ts-node apps/course/src/database/seed.ts
 */

export async function seedCourses(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const sectionRepository = dataSource.getRepository(Section);
  const lessonRepository = dataSource.getRepository(Lesson);

  console.log('🌱 Seeding courses...');

  // Course 1: Introduction to JavaScript
  const jsCourse = courseRepository.create({
    title: 'Complete JavaScript Course',
    description:
      'Master JavaScript from beginner to advanced. Learn modern ES6+, async programming, and more.',
    category: 'programming',
    level: CourseLevel.BEGINNER,
    price: 29.99,
    thumbnail: 'https://example.com/js-course.jpg',
    previewVideo: 'https://example.com/js-preview.mp4',
    status: CourseStatus.PUBLISHED,
    instructorId: '123e4567-e89b-12d3-a456-426614174000',
    instructorName: 'John Doe',
    enrollmentCount: 1500,
    rating: 4.8,
    reviewCount: 350,
    requirements: [
      'Basic computer knowledge',
      'No prior coding experience needed',
    ],
    whatYouWillLearn: [
      'JavaScript fundamentals',
      'ES6+ features',
      'Async programming',
      'DOM manipulation',
    ],
    tags: ['javascript', 'programming', 'web-development'],
    language: 'en',
    publishedAt: new Date(),
  });
  await courseRepository.save(jsCourse);

  // Add sections
  const jsSection1 = sectionRepository.create({
    title: 'Getting Started',
    description: 'Introduction to JavaScript',
    courseId: jsCourse.id,
    orderIndex: 0,
  });
  await sectionRepository.save(jsSection1);

  const jsSection2 = sectionRepository.create({
    title: 'Variables and Data Types',
    description: 'Learn about JavaScript data types',
    courseId: jsCourse.id,
    orderIndex: 1,
  });
  await sectionRepository.save(jsSection2);

  // Add lessons to section 1
  const lessons1 = [
    {
      title: 'Introduction to JavaScript',
      description: 'What is JavaScript and why learn it',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/js-intro.mp4',
      duration: 600,
      orderIndex: 0,
      isFree: true,
      sectionId: jsSection1.id,
    },
    {
      title: 'Setting Up Development Environment',
      description: 'Install VS Code and Node.js',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/setup.mp4',
      duration: 900,
      orderIndex: 1,
      isFree: true,
      sectionId: jsSection1.id,
    },
    {
      title: 'Your First JavaScript Program',
      description: 'Write and run your first program',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/first-program.mp4',
      duration: 1200,
      orderIndex: 2,
      isFree: false,
      sectionId: jsSection1.id,
    },
  ];

  for (const lessonData of lessons1) {
    const lesson = lessonRepository.create(lessonData);
    await lessonRepository.save(lesson);
  }

  // Add lessons to section 2
  const lessons2 = [
    {
      title: 'Variables in JavaScript',
      description: 'let, const, and var',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/variables.mp4',
      duration: 1500,
      orderIndex: 0,
      isFree: false,
      sectionId: jsSection2.id,
    },
    {
      title: 'Primitive Data Types',
      description: 'Numbers, strings, booleans',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/data-types.mp4',
      duration: 1800,
      orderIndex: 1,
      isFree: false,
      sectionId: jsSection2.id,
    },
    {
      title: 'Practice: Variables Quiz',
      description: 'Test your understanding',
      type: LessonType.QUIZ,
      content: JSON.stringify({
        questions: [
          {
            question: 'Which keyword creates a constant?',
            options: ['let', 'const', 'var'],
            answer: 'const',
          },
        ],
      }),
      duration: 300,
      orderIndex: 2,
      isFree: false,
      sectionId: jsSection2.id,
    },
  ];

  for (const lessonData of lessons2) {
    const lesson = lessonRepository.create(lessonData);
    await lessonRepository.save(lesson);
  }

  console.log('✅ Course 1: JavaScript created');

  // Course 2: Python for Data Science
  const pythonCourse = courseRepository.create({
    title: 'Python for Data Science',
    description:
      'Learn Python programming and data science libraries like NumPy, Pandas, and Matplotlib.',
    category: 'data-science',
    level: CourseLevel.INTERMEDIATE,
    price: 49.99,
    thumbnail: 'https://example.com/python-course.jpg',
    previewVideo: 'https://example.com/python-preview.mp4',
    status: CourseStatus.PUBLISHED,
    instructorId: '123e4567-e89b-12d3-a456-426614174001',
    instructorName: 'Jane Smith',
    enrollmentCount: 850,
    rating: 4.9,
    reviewCount: 200,
    requirements: ['Basic Python knowledge', 'Math fundamentals'],
    whatYouWillLearn: [
      'NumPy arrays',
      'Pandas DataFrames',
      'Data visualization',
      'Statistical analysis',
    ],
    tags: ['python', 'data-science', 'machine-learning'],
    language: 'en',
    publishedAt: new Date(),
  });
  await courseRepository.save(pythonCourse);

  const pySection1 = sectionRepository.create({
    title: 'Introduction to Data Science',
    description: 'Overview of data science',
    courseId: pythonCourse.id,
    orderIndex: 0,
  });
  await sectionRepository.save(pySection1);

  const pyLessons = [
    {
      title: 'What is Data Science?',
      description: 'Introduction to the field',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/ds-intro.mp4',
      duration: 800,
      orderIndex: 0,
      isFree: true,
      sectionId: pySection1.id,
    },
    {
      title: 'NumPy Basics',
      description: 'Working with NumPy arrays',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/numpy.mp4',
      duration: 2000,
      orderIndex: 1,
      isFree: false,
      sectionId: pySection1.id,
    },
  ];

  for (const lessonData of pyLessons) {
    const lesson = lessonRepository.create(lessonData);
    await lessonRepository.save(lesson);
  }

  console.log('✅ Course 2: Python created');

  // Course 3: React Advanced Patterns
  const reactCourse = courseRepository.create({
    title: 'Advanced React Patterns',
    description:
      'Master advanced React concepts including hooks, context, and performance optimization.',
    category: 'web-development',
    level: CourseLevel.ADVANCED,
    price: 59.99,
    thumbnail: 'https://example.com/react-course.jpg',
    previewVideo: 'https://example.com/react-preview.mp4',
    status: CourseStatus.PUBLISHED,
    instructorId: '123e4567-e89b-12d3-a456-426614174002',
    instructorName: 'Mike Johnson',
    enrollmentCount: 650,
    rating: 4.7,
    reviewCount: 150,
    requirements: [
      'Solid JavaScript knowledge',
      'Basic React experience',
      'Understanding of modern ES6+',
    ],
    whatYouWillLearn: [
      'Custom hooks',
      'Context API patterns',
      'Performance optimization',
      'Advanced component patterns',
    ],
    tags: ['react', 'javascript', 'frontend', 'hooks'],
    language: 'en',
    publishedAt: new Date(),
  });
  await courseRepository.save(reactCourse);

  const reactSection1 = sectionRepository.create({
    title: 'Custom Hooks',
    description: 'Build reusable custom hooks',
    courseId: reactCourse.id,
    orderIndex: 0,
  });
  await sectionRepository.save(reactSection1);

  const reactLessons = [
    {
      title: 'Introduction to Custom Hooks',
      description: 'Why and when to create custom hooks',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/custom-hooks-intro.mp4',
      duration: 1000,
      orderIndex: 0,
      isFree: true,
      sectionId: reactSection1.id,
    },
    {
      title: 'Building a useAuth Hook',
      description: 'Create an authentication hook',
      type: LessonType.VIDEO,
      content: 'https://example.com/lessons/useauth.mp4',
      duration: 2500,
      orderIndex: 1,
      isFree: false,
      sectionId: reactSection1.id,
    },
  ];

  for (const lessonData of reactLessons) {
    const lesson = lessonRepository.create(lessonData);
    await lessonRepository.save(lesson);
  }

  console.log('✅ Course 3: React created');

  console.log('🎉 Seeding completed!');
  console.log(`Total courses created: 3`);
}

// Run if executed directly
if (require.main === module) {
  const { dataSource } = require('./ormconfig');

  dataSource
    .initialize()
    .then(async (ds: DataSource) => {
      await seedCourses(ds);
      await ds.destroy();
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
