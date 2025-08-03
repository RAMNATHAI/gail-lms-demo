'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Upload, 
  Video, 
  FileText, 
  FileImage, 
  Link, 
  Music,
  Save,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { AssessmentBuilder } from './AssessmentBuilder';
import { useCourses } from '@/hooks/useCourses';
import toast from 'react-hot-toast';

// TC-004: Create New Course validation schema
const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  objectives: z.array(z.string()).min(1, 'At least one learning objective is required'),
  category: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 hour'),
  isMandatory: z.boolean().default(false),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface ContentItem {
  id: string;
  type: 'video' | 'audio' | 'pdf' | 'document' | 'presentation' | 'link';
  title: string;
  file?: File;
  url?: string;
  description?: string;
  duration?: number;
}

export function CourseCreator() {
  const [step, setStep] = useState(1);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const { createCourse, isLoading } = useCourses();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      objectives: [''],
      isMandatory: false,
    },
  });

  const objectives = watch('objectives');

  // TC-004: Create New Course
  const onSubmit = async (data: CourseFormData) => {
    try {
      const courseData = {
        ...data,
        content: contentItems,
        assessments,
      };
      
      await createCourse(courseData);
      toast.success('Course created successfully!');
      // Reset form or redirect
    } catch (error) {
      toast.error('Failed to create course. Please try again.');
    }
  };

  // TC-005: Add Multi-Format Content
  const addContentItem = (type: ContentItem['type']) => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      type,
      title: '',
    };
    setContentItems([...contentItems, newItem]);
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const removeContentItem = (id: string) => {
    setContentItems(items => items.filter(item => item.id !== id));
  };

  const addObjective = () => {
    setValue('objectives', [...objectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setValue('objectives', newObjectives);
  };

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      setValue('objectives', objectives.filter((_, i) => i !== index));
    }
  };

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'presentation': return <FileImage className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Course Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <Input
                  {...register('title')}
                  placeholder="Enter course title"
                  error={errors.title?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe what learners will gain from this course"
                  rows={4}
                  error={errors.description?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    <option value="technical">Technical Skills</option>
                    <option value="safety">Safety & Compliance</option>
                    <option value="leadership">Leadership & Management</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance & Accounting</option>
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (hours)
                  </label>
                  <Input
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="e.g., 8"
                    error={errors.estimatedDuration?.message}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isMandatory')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Mandatory Course
                  </label>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives
                </label>
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Learning objective ${index + 1}`}
                    />
                    {objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeObjective(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObjective}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Objective
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)}>
                Next: Add Content
              </Button>
            </div>
          </Card>
        )}

        {/* Additional steps would be implemented here */}
        {/* Step 2: Content Upload, Step 3: Assessments, Step 4: Review */}
      </form>
    </div>
  );
}
