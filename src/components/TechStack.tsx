import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const TechStack = () => {
  const technologies = [
    {
      category: 'Blockchain Core',
      techs: [
        { name: 'Ethereum', description: 'Base layer compatibility' },
        { name: 'Solidity', description: 'Smart contract language' },
        { name: 'IPFS', description: 'Distributed storage' }
      ]
    },
    {
      category: 'Development',
      techs: [
        { name: 'React', description: 'Frontend framework' },
        { name: 'Node.js', description: 'Backend runtime' },
        { name: 'Truffle', description: 'Development framework' }
      ]
    },
    {
      category: 'Tools & Analytics',
      techs: [
        { name: 'Ganache', description: 'Local blockchain' },
        { name: 'D3.js', description: 'Data visualization' },
        { name: 'Web3.js', description: 'Blockchain interaction' }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Tech <span className="bg-gradient-primary bg-clip-text text-transparent">Stack</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Built on proven technologies and cutting-edge innovations for maximum reliability and performance
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {technologies.map((category, categoryIndex) => (
            <motion.div key={categoryIndex} variants={itemVariants}>
              <Card className="h-full bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6 font-inter text-center">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.techs.map((tech, techIndex) => (
                      <motion.div
                        key={techIndex}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-background/50 border border-glass-border hover:border-neon-blue/20 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground font-inter">
                              {tech.name}
                            </h4>
                            <p className="text-sm text-muted-foreground font-inter">
                              {tech.description}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm font-mono">
                              {tech.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-accent/5 border-neon-green/20 shadow-glass">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6 font-inter">
                Modular Architecture
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-neon-blue/5 border border-neon-blue/20">
                  <h4 className="font-semibold text-neon-blue mb-2 font-inter">Core Layer</h4>
                  <p className="text-sm text-muted-foreground font-inter">
                    Ethereum-compatible blockchain with cognitive memory management
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
                  <h4 className="font-semibold text-neon-purple mb-2 font-inter">Smart Contracts</h4>
                  <p className="text-sm text-muted-foreground font-inter">
                    Automated data lifecycle management and relevance scoring
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-neon-green/5 border border-neon-green/20">
                  <h4 className="font-semibold text-neon-green mb-2 font-inter">Interface Layer</h4>
                  <p className="text-sm text-muted-foreground font-inter">
                    Developer-friendly APIs and visualization tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;