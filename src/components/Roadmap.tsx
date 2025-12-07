import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Rocket, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Roadmap = () => {
  const roadmapItems = [
    {
      phase: 'Q1 2024',
      title: 'Concept & Research',
      status: 'completed',
      icon: CheckCircle,
      description: 'Initial research and whitepaper development for cognitive blockchain architecture.',
      milestones: ['Market research', 'Technical feasibility study', 'Whitepaper v1.0']
    },
    {
      phase: 'Q2 2024',
      title: 'Prototype Development',
      status: 'completed',
      icon: CheckCircle,
      description: 'Core algorithm development and proof-of-concept implementation.',
      milestones: ['Relevance scoring algorithm', 'Basic prototype', 'Initial testing']
    },
    {
      phase: 'Q3 2024',
      title: 'Testnet Launch',
      status: 'in-progress',
      icon: Clock,
      description: 'Public testnet deployment and community testing phase.',
      milestones: ['Testnet deployment', 'Developer tools', 'Community feedback']
    },
    {
      phase: 'Q4 2024',
      title: 'Mainnet Beta',
      status: 'upcoming',
      icon: Target,
      description: 'Limited mainnet release with select partners and developers.',
      milestones: ['Security audits', 'Partner integration', 'Beta launch']
    },
    {
      phase: 'Q1 2025',
      title: 'Full Launch',
      status: 'upcoming',
      icon: Rocket,
      description: 'Complete mainnet launch with full feature set and ecosystem.',
      milestones: ['Public mainnet', 'DApp ecosystem', 'Exchange listings']
    },
    {
      phase: 'Q2 2025',
      title: 'Ecosystem Growth',
      status: 'upcoming',
      icon: Users,
      description: 'Expanding partnerships and building developer community.',
      milestones: ['Partner network', 'Developer grants', 'Enterprise adoption']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'neon-green';
      case 'in-progress': return 'neon-blue';
      case 'upcoming': return 'neon-purple';
      default: return 'muted';
    }
  };

  return (
    <section id="roadmap" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Development <span className="bg-gradient-secondary bg-clip-text text-transparent">Roadmap</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Our journey from concept to full ecosystem deployment
          </motion.p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-primary transform -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className="flex-1 w-full">
                  <Card className={`bg-card-glass backdrop-blur-sm border-glass-border hover:border-${getStatusColor(item.status)}/30 transition-all duration-300`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-sm font-mono text-muted-foreground mb-1">
                            {item.phase}
                          </div>
                          <h3 className="text-xl font-bold text-foreground font-inter">
                            {item.title}
                          </h3>
                        </div>
                        <div className={`p-2 rounded-full bg-${getStatusColor(item.status)}/10`}>
                          <item.icon className={`h-6 w-6 text-${getStatusColor(item.status)}`} />
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground font-inter mb-4">
                        {item.description}
                      </p>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground font-inter">Key Milestones:</h4>
                        <ul className="space-y-1">
                          {item.milestones.map((milestone, milestoneIndex) => (
                            <li key={milestoneIndex} className="flex items-center text-sm text-muted-foreground font-inter">
                              <span className={`w-1.5 h-1.5 bg-${getStatusColor(item.status)} rounded-full mr-2 flex-shrink-0`}></span>
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline Node */}
                <div className="hidden lg:flex w-16 h-16 bg-background border-4 border-neon-blue rounded-full items-center justify-center z-10">
                  <item.icon className={`h-8 w-8 text-${getStatusColor(item.status)}`} />
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-primary/5 border-neon-blue/20 shadow-neon">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6 font-inter">
                Current Progress
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/20">
                  <div className="text-2xl font-bold text-neon-green mb-2 font-mono">2/6</div>
                  <div className="text-sm text-muted-foreground font-inter">Phases Completed</div>
                </div>
                <div className="p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                  <div className="text-2xl font-bold text-neon-blue mb-2 font-mono">Q3</div>
                  <div className="text-sm text-muted-foreground font-inter">Current Phase</div>
                </div>
                <div className="p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
                  <div className="text-2xl font-bold text-neon-purple mb-2 font-mono">Q1 2025</div>
                  <div className="text-sm text-muted-foreground font-inter">Expected Launch</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Roadmap;