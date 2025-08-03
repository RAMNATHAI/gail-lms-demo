import mongoose, { Document, Schema } from 'mongoose';

// TC-005: Add Multi-Format Content types
export enum ContentType {
  VIDEO = 'video',
  AUDIO = 'audio',
  PDF = 'pdf',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  LINK = 'link',
  INTERACTIVE = 'interactive',
}

// TC-006: Configure Assessments types
export enum AssessmentType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
  ESSAY = 'essay',
  PRACTICAL = 'practical',
}

export interface IContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  url?: string;
  fileUrl?: string;
  duration?: number; // in minutes
  order: number;
  isRequired: boolean;
  
  // TC-010: Interactive Quiz During Video
  interactiveElements?: {
    timestamp: number; // when to show (in seconds)
    type: 'quiz' | 'note' | 'exercise';
    content: any;
  }[];
}

export interface IAssessment {
  id: string;
  type: AssessmentType;
  title: string;
  description?: string;
  questions: IQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number; // in minutes
  isRequired: boolean;
  order: number;
  
  // TC-013: Adaptive Assessment Difficulty
  adaptiveDifficulty: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface IQuestion {
  id: string;
  type: AssessmentType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  objectives: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in hours
  
  // TC-007: Set Mandatory/Optional Courses
  isMandatory: boolean;
  
  // Content and assessments
  content: IContentItem[];
  assessments: IAssessment[];
  
  // Course management
  instructor: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date;
  
  // Enrollment and completion
  enrolledUsers: mongoose.Types.ObjectId[];
  completedUsers: mongoose.Types.ObjectId[];
  
  // TC-017: Badge and Certificate Awards
  certificate: {
    enabled: boolean;
    template?: string;
    criteria: {
      completionRequired: boolean;
      minimumScore: number;
      timeLimit?: number; // in days
    };
  };
  
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: {
      type: 'completion' | 'score' | 'time' | 'streak';
      value: number;
    };
  }[];
  
  // Analytics and tracking
  analytics: {
    totalEnrollments: number;
    completionRate: number;
    averageScore: number;
    averageCompletionTime: number; // in hours
    lastUpdated: Date;
  };
  
  // Social features
  discussions: mongoose.Types.ObjectId[];
  ratings: {
    average: number;
    count: number;
    reviews: {
      userId: mongoose.Types.ObjectId;
      rating: number;
      comment?: string;
      createdAt: Date;
    }[];
  };
  
  // Metadata
  tags: string[];
  prerequisites: mongoose.Types.ObjectId[];
  language: string;
  thumbnail?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const contentItemSchema = new Schema<IContentItem>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(ContentType),
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  url: String,
  fileUrl: String,
  duration: {
    type: Number,
    min: 0,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  interactiveElements: [{
    timestamp: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['quiz', 'note', 'exercise'],
      required: true,
    },
    content: Schema.Types.Mixed,
  }],
});

const questionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(AssessmentType),
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [String],
  correctAnswer: Schema.Types.Mixed,
  explanation: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  tags: [String],
});

const assessmentSchema = new Schema<IAssessment>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(AssessmentType),
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1,
  },
  timeLimit: {
    type: Number,
    min: 1,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  adaptiveDifficulty: {
    type: Boolean,
    default: false,
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
});

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  objectives: [{
    type: String,
    required: true,
    trim: true,
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'Technical Skills',
      'Safety & Compliance',
      'Leadership & Management',
      'Operations',
      'Finance & Accounting',
      'Human Resources',
      'Quality Assurance',
      'Environmental',
      'Legal & Regulatory',
      'Soft Skills',
    ],
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true,
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
  },
  isMandatory: {
    type: Boolean,
    default: false,
    index: true,
  },
  content: [contentItemSchema],
  assessments: [assessmentSchema],
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  publishedAt: Date,
  enrolledUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  completedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  certificate: {
    enabled: {
      type: Boolean,
      default: true,
    },
    template: String,
    criteria: {
      completionRequired: {
        type: Boolean,
        default: true,
      },
      minimumScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      timeLimit: Number,
    },
  },
  badges: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    criteria: {
      type: {
        type: String,
        enum: ['completion', 'score', 'time', 'streak'],
      },
      value: Number,
    },
  }],
  analytics: {
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    averageCompletionTime: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  discussions: [{
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
    reviews: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  tags: [String],
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Course',
  }],
  language: {
    type: String,
    default: 'en',
  },
  thumbnail: String,
}, {
  timestamps: true,
});

// Indexes for performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, difficulty: 1, isPublished: 1 });
courseSchema.index({ isMandatory: 1, isPublished: 1 });
courseSchema.index({ instructor: 1, isPublished: 1 });
courseSchema.index({ 'analytics.completionRate': -1 });
courseSchema.index({ 'ratings.average': -1 });
courseSchema.index({ createdAt: -1 });

// Virtual for completion percentage
courseSchema.virtual('completionPercentage').get(function() {
  if (this.enrolledUsers.length === 0) return 0;
  return (this.completedUsers.length / this.enrolledUsers.length) * 100;
});

// Instance methods
courseSchema.methods.isUserEnrolled = function(userId: mongoose.Types.ObjectId): boolean {
  return this.enrolledUsers.includes(userId);
};

courseSchema.methods.isUserCompleted = function(userId: mongoose.Types.ObjectId): boolean {
  return this.completedUsers.includes(userId);
};

courseSchema.methods.getTotalContentDuration = function(): number {
  return this.content.reduce((total, item) => total + (item.duration || 0), 0);
};

courseSchema.methods.getRequiredContent = function(): IContentItem[] {
  return this.content.filter(item => item.isRequired);
};

courseSchema.methods.getRequiredAssessments = function(): IAssessment[] {
  return this.assessments.filter(assessment => assessment.isRequired);
};

// Static methods
courseSchema.statics.findPublished = function() {
  return this.find({ isPublished: true });
};

courseSchema.statics.findMandatory = function() {
  return this.find({ isMandatory: true, isPublished: true });
};

courseSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublished: true });
};

export const Course = mongoose.model<ICourse>('Course', courseSchema);
