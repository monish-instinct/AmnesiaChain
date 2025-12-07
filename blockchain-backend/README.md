# AmnesiaChain Backend

A cognitive blockchain backend that intelligently manages data lifecycle with memory-inspired architecture.

## Features

- **Cognitive Memory Management**: Three-tier data lifecycle (Active, Archived, Dead)
- **Smart Consensus**: Memory-aware difficulty adjustment algorithm
- **RESTful API**: Comprehensive REST API for blockchain operations
- **Real-time Updates**: WebSocket support for live blockchain events
- **Dual Wallet Support**: Ethereum and Solana wallet integration ready
- **Advanced Analytics**: Memory trends and performance metrics
- **MongoDB Integration**: Persistent storage with optimized indexing

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd blockchain-backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit configuration as needed
nano .env

# Build the project
npm run build

# Start MongoDB (if not running)
mongod

# Start the blockchain node
npm run dev
```

### Docker Setup

```bash
# Build the Docker image
docker build -t amnesiachain-backend .

# Run with Docker Compose
docker-compose up -d
```

## Configuration

Key environment variables:

```env
# Server
PORT=3001
HOST=localhost

# Database  
MONGODB_URL=mongodb://localhost:27017
DB_NAME=amnesiachain

# Blockchain
MINER_ADDRESS=system
MINING_ENABLED=true
AUTO_MINING=false
MINING_INTERVAL=60000

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/amnesiachain.log
```

## API Endpoints

### Blockchain Operations

- `GET /api/blockchain/state` - Get blockchain state
- `GET /api/blockchain/stats` - Get blockchain statistics
- `GET /health` - Health check

### Block Operations

- `GET /api/blocks` - List blocks
- `GET /api/blocks/latest` - Get latest blocks
- `GET /api/blocks/:identifier` - Get block by index or hash
- `POST /api/blocks/mine` - Mine a new block

### Transaction Operations

- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction by ID or hash
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/pending` - Get pending transactions
- `GET /api/transactions/address/:address` - Get transactions by address

### Memory Data Operations

- `GET /api/memory` - List memory data
- `GET /api/memory/stats` - Get memory statistics
- `GET /api/memory/search` - Search memory data
- `GET /api/memory/:id` - Get specific memory data
- `POST /api/memory` - Store new memory data
- `PUT /api/memory/:id/archive` - Archive memory data
- `PUT /api/memory/:id/promote` - Promote archived data
- `DELETE /api/memory/:id` - Forget memory data

### Address Operations

- `GET /api/address/:address` - Get address information
- `GET /api/address/:address/memory` - Get address memory data

### Analytics

- `GET /api/analytics/memory-trends` - Memory trend analysis
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/consensus/stats` - Consensus statistics
- `GET /api/network/hashrate` - Network hash rate

## Architecture

### Core Components

1. **AmnesiaChain**: Main blockchain class with memory management
2. **MemoryManager**: Handles data lifecycle operations
3. **CognitiveConsensus**: Memory-aware consensus mechanism
4. **Database**: MongoDB persistence layer
5. **ApiServer**: RESTful API and WebSocket server
6. **Logger**: Comprehensive logging system

### Memory Management

The blockchain uses a three-tier memory system:

```
Active Memory (Hot Storage)
├── High relevance score (>70)
├── Recently accessed
└── Frequently used data

Cold Storage (Archive)
├── Medium relevance score (30-70)
├── Less frequently accessed
└── Historical data

Dead Data (Forgotten)
├── Low relevance score (<30)
├── Obsolete information
└── Permanently deleted after grace period
```

### Cognitive Consensus

The consensus mechanism considers:
- Memory efficiency scores
- Data relevance trends
- Storage optimization
- Network health metrics

Higher memory efficiency reduces mining difficulty, encouraging efficient data management.

## Development

### Building

```bash
npm run build        # Build TypeScript to JavaScript
npm run dev          # Development mode with auto-reload
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Mining

```bash
# Manual mining
npm run mine

# Auto-mining (set AUTO_MINING=true in .env)
npm run dev
```

### Testing

```bash
npm test             # Run tests
npm run test:watch   # Watch mode
```

## WebSocket Events

Connect to `ws://localhost:3001` to receive real-time events:

- `blockchain:initialized` - Blockchain ready
- `blockchain:blockAdded` - New block mined
- `blockchain:transactionAdded` - New transaction
- `memory:dataArchived` - Data archived
- `memory:dataPromoted` - Data promoted
- `memory:dataForgotten` - Data forgotten
- `consensus:difficultyAdjusted` - Difficulty changed
- `mining:blockMined` - Block successfully mined

## Production Deployment

### Security Considerations

1. **Environment Variables**: Use secure values for production
2. **Rate Limiting**: Configure appropriate API limits
3. **Authentication**: Implement JWT or API key authentication
4. **CORS**: Restrict origins to your frontend domains
5. **Database**: Use replica sets and authentication
6. **Monitoring**: Set up logging and alerting

### Scaling

1. **Database**: Use MongoDB Atlas or cluster setup
2. **Load Balancing**: Use nginx or cloud load balancers
3. **Caching**: Implement Redis for frequently accessed data
4. **Monitoring**: Use Prometheus/Grafana or cloud monitoring

### Docker Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  amnesiachain:
    image: amnesiachain-backend:latest
    environment:
      - NODE_ENV=production
      - MONGODB_URL=mongodb://mongo:27017
      - LOG_CONSOLE=false
    ports:
      - "3001:3001"
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

## Monitoring

### Health Checks

The `/health` endpoint provides comprehensive health information:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "blockchain": {
      "height": 42,
      "lastBlock": "0x123..."
    },
    "database": {
      "connected": true
    }
  }
}
```

### Logs

Logs are written to:
- Console (development)
- File: `logs/amnesiachain.log`
- Error file: `logs/amnesiachain.error.log`

Log levels: `error`, `warn`, `info`, `debug`, `verbose`

### Metrics

Key metrics available via API:
- Memory efficiency trends
- Consensus statistics
- Performance metrics
- Network hash rate
- Transaction throughput

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

3. **Out of Memory**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

4. **Blockchain Corruption**
   ```bash
   # Reset blockchain (development only)
   curl -X POST http://localhost:3001/api/admin/reset
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document public APIs
- Use conventional commits

## License

MIT License - see LICENSE file for details

## Support

- Create issues on GitHub
- Check the logs for error details
- Review the API documentation
- Join our community discussions

---

**AmnesiaChain Backend** - Cognitive Blockchain with Memory Management
