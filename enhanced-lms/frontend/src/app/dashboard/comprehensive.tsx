'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Award, TrendingUp, LogOut, Brain, Play, Clock, Star, Target, MessageCircle, BarChart3, Calendar, CheckCircle, AlertCircle, Zap, Trophy, Fire } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  isMandatory: boolean;
}

export default function ComprehensiveDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI-Powered Learning Stats
  const [learningStats] = useState({
    coursesEnrolled: 8,
    coursesCompleted: 3,
    studyGroups: 2,
    learningStreak: 7,
    skillsProgress: 65,
    weeklyGoal: 80,
    totalHours: 24,
    certificates: 2
  });

  // AI Recommendations
  const [aiRecommendations] = useState([
    {
      id: 1,
      title: 'Advanced Pipeline Safety',
      reason: 'Based on your operations background and recent safety course completion',
      confidence: 95,
      estimatedTime: '3 hours',
      difficulty: 'Intermediate',
      priority: 'High',
      skills: ['Safety Management', 'Risk Assessment']
    },
    {
      id: 2,
      title: 'Digital Transformation in Energy',
      reason: 'Trending in your department, matches your learning goals',
      confidence: 87,
      estimatedTime: '2 hours',
      difficulty: 'Beginner',
      priority: 'Medium',
      skills: ['Digital Tools', 'Process Optimization']
    }
  ]);

  // Recent Activity
  const [recentActivity] = useState([
    { type: 'completed', title: 'Safety Protocols Basics', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
    { type: 'started', title: 'Pipeline Management', time: '1 day ago', icon: Play, color: 'text-blue-600' },
    { type: 'achievement', title: 'Safety Expert Badge', time: '2 days ago', icon: Trophy, color: 'text-yellow-600' },
    { type: 'joined', title: 'Operations Excellence Group', time: '3 days ago', icon: Users, color: 'text-purple-600' }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/courses`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">GAIL Enhanced LMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Fire className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">{learningStats.learningStreak} day streak</span>
              </div>
              <div className="text-sm text-gray-700">
                Welcome, {user?.firstName}
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user?.role}
                </span>
              </div>
              <button onClick={handleLogout} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
              <p className="text-blue-100 text-lg">Continue your learning journey with AI-powered recommendations</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.coursesEnrolled}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.coursesCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Study Groups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.studyGroups}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Learning Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.totalHours}h</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">AI-Powered Recommendations</h3>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Personalized</span>
            </div>
            
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{rec.estimatedTime}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          rec.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {rec.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{rec.confidence}% match</span>
                      </div>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                        Start Learning
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Browse All Courses</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Skills Assessment</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Join Study Group</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">AI Chat Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Available Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{course.estimatedDuration}h</span>
                </div>
                {course.isMandatory && (
                  <div className="flex items-center space-x-1 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">Mandatory</span>
                  </div>
                )}
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Course
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
