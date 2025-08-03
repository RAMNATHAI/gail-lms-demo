import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// TC-003: Admin Role Access - Define user roles
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  LEARNER = 'learner',
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  
  // Security fields for TC-002: Invalid Login handling
  failedLoginAttempts?: number;
  lastFailedLogin?: Date;
  accountLocked?: boolean;
  lockUntil?: Date;
  lastLogin?: Date;
  
  // Learning preferences for TC-014: Personalized Learning
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  
  // Progress tracking for TC-015: Real-Time Event Tracking
  learningStats: {
    coursesCompleted: number;
    totalLearningTime: number; // in minutes
    averageScore: number;
    streakDays: number;
    lastActivity: Date;
  };
  
  // Social features for TC-019-022: Social Learning
  social: {
    bio?: string;
    expertise: string[];
    mentorAvailable: boolean;
    studyGroups: mongoose.Types.ObjectId[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Engineering',
      'Operations',
      'Finance',
      'Human Resources',
      'Information Technology',
      'Marketing',
      'Legal',
      'Safety',
      'Quality Assurance',
      'Research & Development',
    ],
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.LEARNER,
    index: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // Security fields
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastFailedLogin: Date,
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: Date,
  lastLogin: Date,
  
  // Learning preferences
  preferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic'],
      default: 'visual',
    },
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
  },
  
  // Learning statistics
  learningStats: {
    coursesCompleted: {
      type: Number,
      default: 0,
    },
    totalLearningTime: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Social features
  social: {
    bio: {
      type: String,
      maxlength: 500,
    },
    expertise: [{
      type: String,
    }],
    mentorAvailable: {
      type: Boolean,
      default: false,
    },
    studyGroups: [{
      type: Schema.Types.ObjectId,
      ref: 'StudyGroup',
    }],
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ employeeId: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1, isActive: 1 });
userSchema.index({ 'learningStats.lastActivity': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.isAdmin = function(): boolean {
  return this.role === UserRole.ADMIN;
};

userSchema.methods.isInstructor = function(): boolean {
  return this.role === UserRole.INSTRUCTOR;
};

userSchema.methods.canManageCourses = function(): boolean {
  return this.role === UserRole.ADMIN || this.role === UserRole.INSTRUCTOR;
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findByDepartment = function(department: string) {
  return this.find({ department, isActive: true });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model<IUser>('User', userSchema);
