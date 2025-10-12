import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, BookOpen, Gift, CheckCircle, Star } from 'lucide-react';

export default function FreeTrial() {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    age: '',
    level: '',
    preferredTime: '',
    preferredDay: '',
    goals: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const benefits = [
    {
      icon: Gift,
      title: 'Completely Free',
      description: 'No hidden costs or commitments. Just pure learning experience.'
    },
    {
      icon: User,
      title: 'Expert Teacher',
      description: 'Learn from certified Quran teachers with years of experience.'
    },
    {
      icon: Clock,
      title: '30-Minute Session',
      description: 'Perfect duration to assess your level and create a learning plan.'
    },
    {
      icon: BookOpen,
      title: 'Personalized Assessment',
      description: 'Get a customized learning path based on your current level.'
    }
  ];

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM'
  ];

  const days = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  const levels = [
    'Complete Beginner',
    'Basic Arabic Letters',
    'Reading with Harakat',
    'Fluent Reading',
    'Tajweed Rules',
    'Memorization (Hifz)'
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <CheckCircle className="h-24 w-24 text-emerald-500 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your free trial request has been submitted successfully. Our team will contact you within 24 hours to schedule your session.
            </p>
            <div className="bg-emerald-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-emerald-800 mb-4">What happens next?</h3>
              <ul className="text-left space-y-3 text-emerald-700">
                <li className="flex items-center">
                  <Star className="h-5 w-5 mr-3" />
                  We'll call you to confirm your preferred time
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 mr-3" />
                  You'll receive a Zoom link for your session
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 mr-3" />
                  Meet your assigned teacher and start learning
                </li>
              </ul>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Gift className="h-20 w-20 text-yellow-300 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Your
              <span className="block text-yellow-300">Free Trial Lesson</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Experience our world-class Quran education with a complimentary 30-minute session
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You'll Get
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to start your Quran learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Book Your Free Session
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter student's name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter parent's name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Student Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter age"
                    min="4"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select current level</option>
                    {levels.map((level, index) => (
                      <option key={index} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preferredDay" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Day *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      id="preferredDay"
                      name="preferredDay"
                      value={formData.preferredDay}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select preferred day</option>
                      {days.map((day, index) => (
                        <option key={index} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select preferred time</option>
                      {timeSlots.map((time, index) => (
                        <option key={index} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goals (Optional)
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Tell us about your learning goals and what you hope to achieve..."
                />
              </div>

              <div className="text-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Book My Free Trial
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  * Required fields. We'll contact you within 24 hours.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Is the trial lesson really free?
              </h3>
              <p className="text-gray-600">
                Yes, absolutely! There are no hidden costs or commitments. It's our way of letting you experience our teaching quality.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What do I need for the online lesson?
              </h3>
              <p className="text-gray-600">
                Just a computer, tablet, or smartphone with internet connection. We'll send you a Zoom link before the session.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Can adults take the trial lesson?
              </h3>
              <p className="text-gray-600">
                Absolutely! We welcome students of all ages, from children to adults. Our teachers adapt their approach to suit each student.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}