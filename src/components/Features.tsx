import { motion } from 'framer-motion';
import { Brain, Zap, Leaf, Cpu } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'Relevance Scoring',
      description: 'AI-powered algorithms continuously assess data importance and usage patterns to determine storage priority.',
      color: 'neon-blue'
    },
    {
      icon: Zap,
      title: 'Smart Contract Automation',
      description: 'Automated data lifecycle management through intelligent smart contracts that handle archiving and deletion.',
      color: 'neon-purple'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly Blockchain',
      description: 'Reduced energy consumption through optimized storage and efficient consensus mechanisms.',
      color: 'neon-green'
    },
    {
      icon: Cpu,
      title: 'IoT & Edge Compatible',
      description: 'Lightweight architecture perfect for IoT devices and edge computing environments.',
      color: 'neon-cyan'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Core <span className="bg-gradient-accent bg-clip-text text-transparent">Features</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Advanced capabilities that make AmnesiaChain the future of intelligent blockchain technology
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 rounded-full bg-${feature.color}/10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 font-inter">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-inter leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-primary/10 border border-neon-blue/20">
              <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
                Revolutionary Memory Architecture
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl font-inter">
                AmnesiaChain introduces the first blockchain with cognitive memory management, 
                automatically categorizing data into Active, Cold, and Dead states for optimal performance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;