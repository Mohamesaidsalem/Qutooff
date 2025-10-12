"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "quran",
    label: "Quran Courses",
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Quran Courses</h2>
        <p className="text-gray-700">
          Learn how to recite the Quran with proper Tajweed and deepen your understanding
          with professional teachers and personalized lessons.
        </p>
      </div>
    ),
  },
  {
    id: "tajweed",
    label: "Tajweed Rules",
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Tajweed Rules</h2>
        <p className="text-gray-700">
          Master the rules of Tajweed step by step, with interactive sessions designed
          to make your recitation beautiful and correct.
        </p>
      </div>
    ),
  },
  {
    id: "memorization",
    label: "Memorization",
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Memorization</h2>
        <p className="text-gray-700">
          Build a solid memorization routine with guided techniques and one-on-one coaching
          to help you retain and review effectively.
        </p>
      </div>
    ),
  },
  {
    id: "arabic",
    label: "Arabic Language",
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Arabic Language</h2>
        <p className="text-gray-700">
          Improve your Arabic language skills to understand the Quran better and
          communicate confidently in daily life.
        </p>
      </div>
    ),
  },
];

// NOTE: The separate <section> below is not needed since the main component already returns one.
// <section id="courses" className="py-16 bg-gray-50">
//   <div className="container mx-auto px-6 lg:px-12">
//     <h2 className="text-4xl font-bold text-center text-emerald-900 mb-12">
//       Our Courses
//     </h2>
//     {/* rest of the code ... */}
//   </div>
// </section>

export default function CoursesTabs() {
  const [activeTab, setActiveTab] = useState("quran");

  return (
    <section id="courses" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center text-emerald-900 mb-12">
          Our Courses
        </h2>

        {/* Tabs Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md"
                    : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Book Style Card */}
        <div className="relative bg-white rounded-xl shadow-xl border-l-8 border-r-8 border-yellow-500 p-10 overflow-hidden">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-20 pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {tabs.map(
              (tab) =>
                activeTab === tab.id && (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    {tab.content}
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}