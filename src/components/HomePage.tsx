import Hero from "../components/Landing/Hero";
import CoursesTabs from "../components/CoursesTabs";

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <>
      <Hero onGetStarted={onGetStarted} />
      <CoursesTabs />
    </>
  );
}
