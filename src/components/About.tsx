import { motion } from 'framer-motion';
import { AlertTriangle, Brain, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: 'Storage Bloat',
      description: 'Traditional blockchains grow indefinitely, making node operation expensive and inefficient.'
    },
    {
      icon: TrendingUp,
      title: 'Scalability Issues',
      description: 'Network performance degrades as the blockchain size increases exponentially over time.'
    }
  ];

  const solutions = [
    {
      icon: Brain,
      title: 'Cognitive Memory System',
      description: 'Smart relevance scoring determines what data to keep, archive, or delete automatically.'
    },
    {
      icon: Zap,
      title: 'Efficient Resource Usage',
      description: 'Optimized storage and faster synchronization through intelligent data lifecycle management.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            About <span className="bg-gradient-secondary bg-clip-text text-transparent">AmnesiaChain</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Revolutionizing blockchain architecture through cognitive-inspired data management
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-8 font-inter">The Problem</h3>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <Card key={index} className="bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                        <problem.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2 font-inter">
                          {problem.title}
                        </h4>
                        <p className="text-muted-foreground font-inter">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-8 font-inter">Our Solution</h3>
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <Card key={index} className="bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-green/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-neon-green/10 text-neon-green">
                        <solution.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2 font-inter">
                          {solution.title}
                        </h4>
                        <p className="text-muted-foreground font-inter">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Central Concept */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-primary/5 border-neon-blue/30 shadow-neon">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 text-neon-blue mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
                Human-Inspired Architecture
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
                Just as the human brain selectively retains important memories and forgets irrelevant details, 
                AmnesiaChain uses advanced algorithms to determine data relevance and optimize storage accordingly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default About;