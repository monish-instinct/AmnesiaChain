-- Add sample memory nodes with real data for IPFS demonstration
INSERT INTO public.memory_nodes (
  node_address,
  block_id,
  state,
  access_count,
  cognitive_score,
  metadata,
  last_accessed
)
SELECT 
  'node_' || gen_random_uuid()::text,
  (SELECT id FROM public.memory_blocks LIMIT 1),
  'active',
  floor(random() * 100)::bigint,
  random(),
  jsonb_build_object(
    'content_type', content_type,
    'size_bytes', size_bytes,
    'compressed_size', compressed_size,
    'compression_ratio', compression_ratio,
    'data_content', data_content,
    'description', description
  ),
  now() - (random() * interval '30 days')
FROM (
  VALUES 
    ('Smart Contract Code', 245000, 52000, 78.8, 
     '{"contract": "AmnesiaChain", "version": "2.1.0", "functions": ["archive", "promote", "forget"], "language": "solidity"}',
     'Production smart contract for memory lifecycle management'),
    ('IoT Sensor Logs', 1850000, 425000, 77.0,
     '{"deviceId": "sensor_01", "readings": [{"temp": 24.5, "humidity": 65, "timestamp": "2024-11-03T10:30:00Z"}], "location": "smart_home"}',
     'Historical sensor data from smart home devices'),
    ('User Profile Data', 89000, 18000, 79.8,
     '{"userId": "user_12345", "preferences": {"theme": "dark", "notifications": true}, "activity": "high"}',
     'User preferences and activity metadata'),
    ('Transaction Records', 3200000, 680000, 78.8,
     '{"transactions": [{"hash": "0xabc123", "type": "archive", "gas": 45000, "status": "confirmed"}], "count": 1247}',
     'Blockchain transaction history and metadata'),
    ('Medical Records', 5600000, 1200000, 78.6,
     '{"patientId": "P789", "records": [{"date": "2024-10-15", "type": "checkup", "encrypted": true}], "hipaa_compliant": true}',
     'Encrypted patient medical records (anonymized demo)'),
    ('Financial Reports', 4100000, 890000, 78.3,
     '{"quarter": "Q3_2024", "revenue": 1200000, "expenses": 850000, "profit": 350000, "encrypted": true}',
     'Quarterly financial data and analysis'),
    ('ML Training Data', 8900000, 1950000, 78.1,
     '{"model": "cognitive_scoring", "samples": 50000, "accuracy": 0.94, "last_trained": "2024-10-20"}',
     'Machine learning model training dataset'),
    ('Archive Snapshots', 12500000, 2800000, 77.6,
     '{"snapshot_id": "snap_001", "blocks": 1500, "nodes": 5000, "timestamp": "2024-11-01T00:00:00Z"}',
     'System state snapshot for disaster recovery')
) AS sample_data(content_type, size_bytes, compressed_size, compression_ratio, data_content, description);

-- Add a few more nodes in archived state
INSERT INTO public.memory_nodes (
  node_address,
  block_id,
  state,
  access_count,
  cognitive_score,
  archived_at,
  metadata,
  last_accessed
)
SELECT 
  'node_' || gen_random_uuid()::text,
  (SELECT id FROM public.memory_blocks LIMIT 1),
  'archived',
  floor(random() * 50)::bigint,
  random() * 0.5,
  now() - (random() * interval '15 days'),
  jsonb_build_object(
    'content_type', content_type,
    'size_bytes', size_bytes,
    'compressed_size', compressed_size,
    'compression_ratio', compression_ratio,
    'data_content', data_content,
    'description', description
  ),
  now() - (random() * interval '45 days')
FROM (
  VALUES 
    ('Legacy API Logs', 6800000, 1500000, 77.9,
     '{"service": "api_v1", "requests": 250000, "errors": 45, "deprecated": true}',
     'Deprecated API version logs for compliance'),
    ('Old Email Archives', 15000000, 3400000, 77.3,
     '{"account": "archived@example.com", "messages": 12500, "attachments": 450}',
     'Historical email communications archive')
) AS archived_data(content_type, size_bytes, compressed_size, compression_ratio, data_content, description);
