import { BookOpen, Play, FileText, CheckCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function Learn() {
  const courses = [
    {
      title: 'Investment Basics',
      description: 'Learn the fundamentals of investing and build a solid foundation.',
      lessons: 12,
      duration: '3 hours',
      level: 'Beginner',
      icon: BookOpen,
    },
    {
      title: 'Crypto Trading',
      description: 'Master cryptocurrency trading with technical analysis and strategies.',
      lessons: 18,
      duration: '5 hours',
      level: 'Intermediate',
      icon: Play,
    },
    {
      title: 'Risk Management',
      description: 'Learn how to protect your portfolio and minimize losses.',
      lessons: 8,
      duration: '2 hours',
      level: 'Advanced',
      icon: FileText,
    },
  ];

  const articles = [
    {
      title: 'Understanding Market Cycles',
      category: 'Market Analysis',
      readTime: '5 min read',
    },
    {
      title: 'Diversification Strategies',
      category: 'Portfolio Management',
      readTime: '8 min read',
    },
    {
      title: 'Tax Implications of Trading',
      category: 'Taxes',
      readTime: '10 min read',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Fintrivox Academy
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Master the art of investing with our comprehensive educational resources.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <GraduationCap className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Video Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25K+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-gray-600">Start your learning journey with these popular courses</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <course.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <Badge className="mb-3">{course.level}</Badge>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span>{course.lessons} lessons</span>
                    <span>{course.duration}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Start Course
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
            <p className="text-gray-600">Stay informed with our expert insights</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">{article.category}</Badge>
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-500">{article.readTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-600 mb-8">
            Create a free account and access all our educational resources.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
