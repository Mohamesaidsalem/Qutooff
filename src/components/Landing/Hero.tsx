
import { motion } from "framer-motion";



interface HeroProps {

  onGetStarted: () => void;

}



export default function Hero({ onGetStarted }: HeroProps) {

  return (

    <section className="relative bg-gradient-to-r from-emerald-900 to-emerald-700 text-white min-h-[80vh] flex items-center">

  {/* الخلفية بالنقط */}

  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] [background-size:20px_20px]"></div>



  {/* المحتوى */}

  <div className="relative container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12">

    {/* Text Section */}

    <motion.div

      initial={{ opacity: 0, x: -50 }}

      animate={{ opacity: 1, x: 0 }}

      transition={{ duration: 0.8 }}

      className="flex-1 text-center lg:text-left"

    >

      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">

        Welcome to <span className="text-yellow-400">Qutooff Academy</span>

      </h1>

      <p className="text-lg md:text-xl mb-8 text-gray-200">

        Learn Quran with expert teachers anytime, anywhere.

        Flexible schedules, personalized lessons, and professional guidance.

      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

        <button

          onClick={onGetStarted}

          className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-xl shadow-lg hover:bg-yellow-300 transition"

        >

          Get Started

        </button>

        <button

  onClick={() => {

    const section = document.getElementById("courses");

    if (section) {

      section.scrollIntoView({ behavior: "smooth" });

    }

  }}

  className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition"

>

  Learn More

</button>

      </div>

    </motion.div>



    {/* Image Section */}

    <motion.div

      initial={{ opacity: 0, x: 50 }}

      animate={{ opacity: 1, x: 0 }}

      transition={{ duration: 0.8, delay: 0.3 }}

      className="flex-1"

    >

      <img

        src="node_modules\public\holding-book-moonlight.jpg"

        alt="Quran Learning"

        className="w-full max-w-md mx-auto lg:mx-0 drop-shadow-2xl rounded-2xl"

      />

    </motion.div>

  </div>

</section>

  );

}



// This Hero component can be used in the HomePage component as shown below:

