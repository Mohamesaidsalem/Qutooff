import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function Reviews() {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      id: 1,
      name: 'Fatima Al-Zahra',
      role: 'Parent',
      country: 'UAE',
      rating: 5,
      text: 'My daughter has been learning with Quran Academy for 6 months now. The improvement in her recitation and understanding is remarkable. The teachers are patient and very knowledgeable.',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      role: 'Student',
      country: 'Egypt',
      rating: 5,
      text: 'As an adult learner, I was worried about starting Quran lessons. But the academy made it so comfortable and easy. I can now read Quran fluently, Alhamdulillah!',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Aisha Mohammed',
      role: 'Parent',
      country: 'UK',
      rating: 5,
      text: 'The flexibility of online classes is perfect for our busy schedule. My son loves his teacher and looks forward to every lesson. Highly recommended!',
      image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 4,
      name: 'Omar Abdullah',
      role: 'Student',
      country: 'Canada',
      rating: 5,
      text: 'The Tajweed lessons are exceptional. My teacher corrects every mistake with patience and provides clear explanations. My recitation has improved tremendously.',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 5,
      name: 'Khadija Ali',
      role: 'Parent',
      country: 'USA',
      rating: 5,
      text: 'Both my children are enrolled here. The academy provides excellent Islamic education along with Quran learning. The teachers are like family to us.',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 6,
      name: 'Yusuf Ibrahim',
      role: 'Student',
      country: 'Australia',
      rating: 5,
      text: 'I completed my Quran memorization here. The structured approach and constant encouragement from teachers made this journey beautiful and achievable.',
      image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const stats = [
    { number: '4.9/5', label: 'Average Rating' },
    { number: '2,500+', label: 'Reviews' },
    { number: '98%', label: 'Recommend Us' },
    { number: '10,000+', label: 'Happy Students' }
  ];

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              What Our Students
              <span className="block text-yellow-300">Are Saying</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Real stories from real students and parents who have experienced 
              the transformative power of Quran education
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
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Review */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Reviews
            </h2>
            <p className="text-xl text-gray-600">
              Hear directly from our community
            </p>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <Quote className="h-16 w-16 text-blue-200 mb-6" />
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                {renderStars(reviews[currentReview].rating)}
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
                "{reviews[currentReview].text}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={reviews[currentReview].image}
                  alt={reviews[currentReview].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {reviews[currentReview].name}
                  </h4>
                  <p className="text-gray-600">
                    {reviews[currentReview].role} • {reviews[currentReview].country}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={prevReview}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={nextReview}
                  className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Review indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentReview ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Reviews Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              More Reviews
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied students and parents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-600">
                      {review.role} • {review.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of learners and experience the difference yourself
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Get Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}