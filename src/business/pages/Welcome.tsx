import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Welcome to ForkCast Business",
    subtitle: "Manage your restaurant, monitor customer conversations, and gain insights with AI-powered analytics.",
    img: "/assets/wood-bg.jpg",
  },
  {
    title: "Real-time Chat",
    subtitle: "Respond to customer inquiries, view conversation history, and train your assistant.",
    img: "/assets/wood-bg.jpg",
  },
  {
    title: "Actionable Analytics",
    subtitle: "See trends, ratings, and recommendation performance — all in one place.",
    img: "/assets/wood-bg.jpg",
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const goToDashboard = () => {
    setLeaving(true);
    setTimeout(() => navigate('/business/app'), 350);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className={`max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ${leaving ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img src={slides[index].img} alt="slide" className="w-full h-64 object-cover md:h-full" />
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-2xl font-bold mb-4">{slides[index].title}</h1>
            <p className="text-muted-foreground mb-6">{slides[index].subtitle}</p>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}>
                <ArrowLeft />
              </Button>

              <div className="flex-1 text-sm text-muted-foreground">{index + 1} / {slides.length}</div>

              <Button onClick={goToDashboard}>
                Continue to dashboard <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
