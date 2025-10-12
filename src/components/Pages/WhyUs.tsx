import React from 'react';
import { Award, Users, Clock, Shield, Star, BookOpen, Heart, Globe } from 'lucide-react';

export default function WhyUs() {
  const features = [
    {
      icon: Award,
      title: 'Certified Teachers',
      description: 'All our teachers are certified with Ijazah and have years of experience in Quran teaching.',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: Users,
      title: 'Personalized Learning',
      description: 'One-on-one sessions tailored to each student\'s pace and learning style.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Learn at your convenience with flexible timing that fits your busy lifestyle.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Shield,
      title: 'Safe Environment',
      description: 'Secure online platform with parental controls and monitored sessions.',
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Star,
      title: 'Proven Results',
      description: 'Over 95% of our students show significant improvement within 3 months.',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Join thousands of students from around the world in their Quran journey.',
      color: 'text-indigo-600 bg-indigo-100'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Students' },
    { number: '500+', label: 'Certified Teachers' },
    { number: '50+', label: 'Countries Served' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Why Choose Our
              <span className="block text-yellow-300">Quran Academy?</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Discover what makes us the preferred choice for Quran education worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine traditional Islamic education with modern technology to provide 
              the best Quran learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                To make Quran education accessible to everyone, everywhere. We believe that 
                learning the Holy Quran should not be limited by geography, time, or circumstances.
              </p>
              <div className="flex items-center space-x-4">
                <Heart className="h-8 w-8 text-red-300" />
                <span className="text-lg font-medium">
                  Spreading the light of Quran with love and dedication
                </span>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
              <BookOpen className="h-16 w-16 text-yellow-300 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <ul className="space-y-3 text-emerald-100">
                <li className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-300 mr-3" />
                  Quality education with authentic Islamic values
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-300 mr-3" />
                  Patient and caring approach to every student
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-300 mr-3" />
                  Continuous support throughout your journey
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}