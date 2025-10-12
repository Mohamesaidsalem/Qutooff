import React from 'react';
import { BookOpen, Users, Clock, Star, ArrowRight, Play, Award, Heart } from 'lucide-react';

// تحديد نوع الخصائص (props) التي سيستقبلها المكون
interface CoursesPageProps {
  onEnroll: () => void;
}

// استخدام النوع في تعريف المكون
export default function CoursesPage({ onEnroll }: CoursesPageProps) {
  const courses = [
    {
      id: 1,
      title: 'Quran Iqraa Classes',
      description: 'Learn the basics of Quran reading with proper pronunciation and Tajweed rules.',
      duration: '3-6 months',
      students: '150+',
      rating: 4.9,
      price: '$60/month',
      features: ['Basic Arabic letters', 'Tajweed fundamentals', 'Interactive learning', 'One-on-one sessions'],
      icon: BookOpen,
      color: 'bg-primary-500'
    },
    {
      id: 2,
      title: 'Quran Recitation for Kids',
      description: 'Perfect recitation skills with beautiful voice and proper intonation for children.',
      duration: '6-12 months',
      students: '200+',
      rating: 4.8,
      price: '$70/month',
      features: ['Voice improvement', 'Melody techniques', 'Performance skills', 'Regular assessments'],
      icon: Play,
      color: 'bg-gold-500'
    },
    {
      id: 3,
      title: 'Online Hifz Classes',
      description: 'Complete Quran memorization program with systematic approach and regular revision.',
      duration: '2-4 years',
      students: '100+',
      rating: 5.0,
      price: '$80/month',
      features: ['Complete memorization', 'Daily revision', 'Progress tracking', 'Certificate upon completion'],
      icon: Award,
      color: 'bg-green-500'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Early Development',
      description: 'Starting at a young age helps children develop strong spiritual foundations'
    },
    {
      icon: Users,
      title: 'Expert Teachers',
      description: 'Qualified instructors with years of experience in teaching children'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Classes scheduled according to your child\'s availability and comfort'
    },
    {
      icon: Star,
      title: 'Proven Results',
      description: 'Hundreds of children have successfully memorized the Quran with us'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Quran for Kids
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              The ideal approach with your child is to begin teaching them the Quran at a young age. 
              We support you in this journey by teaching your child the principles of Quran and helping 
              them grasp its meanings, which fosters their development and leads them to memorize the 
              Quran by heart in short time.
            </p>
            <button onClick={onEnroll} className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center">
              Join Us Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Program?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive and nurturing environment for your child's Quranic education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <benefit.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Outlines Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Outlines</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect course for your child's Quranic journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${course.color} mr-4`}>
                      <course.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-gold-500 mr-1" />
                        <span className="text-sm text-gray-600">{course.rating} ({course.students} students)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">{course.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium text-gray-900">{course.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Students:</span>
                      <span className="font-medium text-gray-900">{course.students}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-bold text-primary-600 text-lg">{course.price}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What you'll learn:</h4>
                    <ul className="space-y-2">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button onClick={onEnroll} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Child's Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of families who have chosen us for their children's Quranic education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onEnroll} className="bg-white text-gold-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gold-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-gold-600 mb-2">50+</div>
              <div className="text-gray-600">Qualified Teachers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Completed Hifz</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}