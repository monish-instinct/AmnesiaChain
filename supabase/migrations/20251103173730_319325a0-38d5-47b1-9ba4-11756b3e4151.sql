-- First, create a sample genesis block if none exists
INSERT INTO public.memory_blocks (block_index, hash, previous_hash, data, nonce, cognitive_weight, state, created_by)
VALUES (
  0,
  '0x' || md5('genesis')::text,
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '{"type": "genesis", "message": "AmnesiaChain Genesis Block"}'::jsonb,
  0,
  1.0,
  'active',
  NULL
)
ON CONFLICT DO NOTHING;

-- Add metadata column to memory_nodes for storing content info
ALTER TABLE public.memory_nodes 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Insert active memory nodes with various cognitive scores
INSERT INTO public.memory_nodes (node_address, block_id, state, access_count, cognitive_score, metadata) 
SELECT 
  'node_' || gen_random_uuid()::text,
  (SELECT id FROM public.memory_blocks ORDER BY created_at DESC LIMIT 1),
  'active',
  floor(random() * 50)::bigint,
  0.5 + (random() * 0.5),
  jsonb_build_object(
    'content_type', (ARRAY['Smart Contract State', 'Transaction Batch', 'Event Logs', 'User Data', 'IoT Sensor Data'])[floor(random() * 5 + 1)],
    'size_bytes', floor(random() * 50000000 + 1000000)::bigint,
    'compressed_size', floor(random() * 10000000 + 500000)::bigint,
    'ipfs_hash', 'Qm' || substr(md5(random()::text), 1, 44),
    'compression_ratio', (70 + random() * 20)::numeric(5,2)
  )
FROM generate_series(1, 15);

-- Insert archived memory nodes
INSERT INTO public.memory_nodes (node_address, block_id, state, access_count, cognitive_score, archived_at, metadata) 
SELECT 
  'node_' || gen_random_uuid()::text,
  (SELECT id FROM public.memory_blocks ORDER BY created_at DESC LIMIT 1),
  'archived',
  floor(random() * 20)::bigint,
  0.2 + (random() * 0.3),
  now() - (random() * interval '14 days'),
  jsonb_build_object(
    'content_type', (ARRAY['Smart Contract State', 'Transaction Batch', 'Event Logs', 'User Data', 'IoT Sensor Data'])[floor(random() * 5 + 1)],
    'size_bytes', floor(random() * 50000000 + 1000000)::bigint,
    'compressed_size', floor(random() * 10000000 + 500000)::bigint,
    'ipfs_hash', 'Qm' || substr(md5(random()::text), 1, 44),
    'compression_ratio', (70 + random() * 20)::numeric(5,2)
  )
FROM generate_series(1, 8);

-- Insert dead memory nodes
INSERT INTO public.memory_nodes (node_address, block_id, state, access_count, cognitive_score, archived_at, deleted_at, metadata) 
SELECT 
  'node_' || gen_random_uuid()::text,
  (SELECT id FROM public.memory_blocks ORDER BY created_at DESC LIMIT 1),
  'dead',
  floor(random() * 10)::bigint,
  0.0 + (random() * 0.2),
  now() - (random() * interval '30 days'),
  now() - (random() * interval '7 days'),
  jsonb_build_object(
    'content_type', (ARRAY['Smart Contract State', 'Transaction Batch', 'Event Logs', 'User Data', 'IoT Sensor Data'])[floor(random() * 5 + 1)],
    'size_bytes', floor(random() * 50000000 + 1000000)::bigint,
    'compressed_size', floor(random() * 10000000 + 500000)::bigint,
    'ipfs_hash', 'Qm' || substr(md5(random()::text), 1, 44),
    'compression_ratio', (70 + random() * 20)::numeric(5,2)
  )
FROM generate_series(1, 5);

-- Create function to archive memory node (move from active to archived)
CREATE OR REPLACE FUNCTION public.archive_memory_node(node_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.memory_nodes
  SET 
    state = 'archived',
    archived_at = now(),
    cognitive_score = cognitive_score * 0.5,
    updated_at = now()
  WHERE id = node_id AND state = 'active';
END;
$$;

-- Create function to promote archived data back to active
CREATE OR REPLACE FUNCTION public.promote_memory_node(node_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.memory_nodes
  SET 
    state = 'active',
    cognitive_score = LEAST(cognitive_score * 1.5, 1.0),
    access_count = access_count + 1,
    last_accessed = now(),
    updated_at = now()
  WHERE id = node_id AND state = 'archived';
END;
$$;

-- Create function to forget (delete) memory node
CREATE OR REPLACE FUNCTION public.forget_memory_node(node_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.memory_nodes
  SET 
    state = 'dead',
    deleted_at = now(),
    cognitive_score = 0,
    updated_at = now()
  WHERE id = node_id AND state IN ('active', 'archived');
END;
$$;