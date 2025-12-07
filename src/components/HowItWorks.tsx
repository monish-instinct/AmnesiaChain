import { motion } from 'framer-motion';
import { Activity, Archive, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      icon: Activity,
      title: 'Active Data',
      description: 'Frequently accessed transactions and smart contract data remain in active storage for instant access.',
      color: 'neon-green',
      stage: '01'
    },
    {
      icon: Archive,
      title: 'Cold Storage',
      description: 'Less frequently used data is archived to cold storage, maintaining accessibility while reducing costs.',
      color: 'neon-blue',
      stage: '02'
    },
    {
      icon: Trash2,
      title: 'Dead Data Removal',
      description: 'Obsolete or irrelevant data is permanently removed after consensus, freeing up network resources.',
      color: 'neon-purple',
      stage: '03'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Understanding the three-stage data lifecycle that powers AmnesiaChain's intelligent memory system
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-primary transform -translate-y-1/2 z-0"></div>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    {/* Stage Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-background border-2 border-neon-blue rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-neon-blue font-mono">{step.stage}</span>
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex p-6 rounded-full bg-${step.color}/10 mb-6 mt-4`}>
                      <step.icon className={`h-12 w-12 text-${step.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground font-inter leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-secondary/5 border-neon-purple/20 shadow-glass">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-6 font-inter">
                Intelligent Data Lifecycle Management
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-4 font-inter">
                    Smart Relevance Algorithm
                  </h4>
                  <ul className="space-y-3 text-muted-foreground font-inter">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Analyzes transaction frequency and patterns
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Evaluates smart contract interaction history
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-purple rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Considers network consensus for data importance
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-4 font-inter">
                    Automated Execution
                  </h4>
                  <ul className="space-y-3 text-muted-foreground font-inter">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-cyan rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Consensus-driven archival processes
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Gradual migration between storage tiers
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-neon-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Secure deletion with cryptographic proof
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;