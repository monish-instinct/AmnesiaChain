import { motion } from 'framer-motion';
import { Zap, TrendingUp, Leaf, Feather } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Advantages = () => {
  const advantages = [
    {
      icon: Zap,
      title: 'Faster Sync',
      stat: '10x',
      description: 'Reduced blockchain size means lightning-fast node synchronization and network participation.',
      color: 'neon-blue'
    },
    {
      icon: TrendingUp,
      title: 'Scalable',
      stat: '∞',
      description: 'Unlimited growth potential without the traditional storage constraints of legacy blockchains.',
      color: 'neon-green'
    },
    {
      icon: Leaf,
      title: 'Sustainable',
      stat: '80%',
      description: 'Dramatically reduced energy consumption through intelligent resource management.',
      color: 'neon-purple'
    },
    {
      icon: Feather,
      title: 'Lightweight',
      stat: '99%',
      description: 'Minimal storage requirements make blockchain accessible to more devices and users.',
      color: 'neon-cyan'
    }
  ];

  const metrics = [
    { label: 'Storage Reduction', value: '99%', trend: '+' },
    { label: 'Sync Speed Improvement', value: '950%', trend: '+' },
    { label: 'Energy Efficiency', value: '80%', trend: '+' },
    { label: 'Network Costs', value: '75%', trend: '-' }
  ];

  return (
    <section id="advantages" className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Key <span className="bg-gradient-accent bg-clip-text text-transparent">Advantages</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Discover the transformative benefits that set AmnesiaChain apart from traditional blockchain solutions
          </motion.p>
        </div>

        {/* Main Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 rounded-full bg-${advantage.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className={`h-8 w-8 text-${advantage.color}`} />
                  </div>
                  <div className={`text-4xl font-bold text-${advantage.color} mb-2 font-mono`}>
                    {advantage.stat}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 font-inter">
                    {advantage.title}
                  </h3>
                  <p className="text-muted-foreground font-inter text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-primary/5 border-neon-blue/20 shadow-neon-lg overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-8 font-inter">
                Performance Metrics
              </h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-6 rounded-lg bg-background/50 border border-glass-border"
                  >
                    <div className={`text-3xl font-bold font-mono mb-2 ${
                      metric.trend === '+' ? 'text-neon-green' : 'text-neon-blue'
                    }`}>
                      {metric.trend}{metric.value}
                    </div>
                    <div className="text-muted-foreground font-inter text-sm">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground font-inter max-w-2xl mx-auto">
                  These performance improvements make AmnesiaChain the most efficient blockchain solution 
                  for modern applications requiring scalability and sustainability.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-secondary/10 border border-neon-green/20">
              <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
                Revolutionary Efficiency
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl font-inter">
                While traditional blockchains grow endlessly, AmnesiaChain maintains optimal size and performance, 
                making it the sustainable choice for the future of decentralized technology.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Advantages;