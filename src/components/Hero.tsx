import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroNeurons from '@/assets/hero-neurons.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroNeurons} 
          alt="Neural network background representing blockchain memory"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-20 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-inter mb-6"
          >
            <span className="text-neon-blue">
              Blockchain
            </span>
            <br />
            <span className="text-foreground">That Learns</span>
            <br />
            <span className="text-neon-purple">and Forgets</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-inter"
          >
            AmnesiaChain is a cognitively inspired blockchain that intelligently manages data lifecycle, 
            storing only what matters and forgetting what doesn't.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-inter font-semibold px-8 py-3 shadow-neon animate-glow"
            >
              <Link to="/login">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 font-inter font-semibold px-8 py-3"
            >
              <FileText className="mr-2 h-5 w-5" />
              Explore Whitepaper
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-neon-purple text-neon-purple hover:bg-neon-purple/10 font-inter font-semibold px-8 py-3"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { number: '99%', label: 'Storage Reduction' },
              { number: '10x', label: 'Faster Sync' },
              { number: '∞', label: 'Scalability' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neon-green mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-inter">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;