import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MemoryNode {
  id: string;
  node_address: string;
  block_id: string;
  state: 'active' | 'archived' | 'dead';
  access_count: number;
  cognitive_score: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  deleted_at?: string;
  last_accessed?: string;
  metadata?: {
    content_type?: string;
    size_bytes?: number;
    compressed_size?: number;
    ipfs_hash?: string;
    compression_ratio?: number;
  };
}

export interface MemoryStats {
  active: number;
  archived: number;
  dead: number;
  totalSize: number;
  averageCognitiveScore: number;
}

// Fetch memory nodes by state
export async function fetchMemoryNodesByState(state: 'active' | 'archived' | 'dead'): Promise<MemoryNode[]> {
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('*')
    .eq('state', state)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as MemoryNode[];
}

// Fetch memory statistics
export async function fetchMemoryStats(): Promise<MemoryStats> {
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('state, cognitive_score, metadata');

  if (error) throw error;

  const stats = {
    active: 0,
    archived: 0,
    dead: 0,
    totalSize: 0,
    averageCognitiveScore: 0,
  };

  let totalScore = 0;
  let count = 0;

  data?.forEach((node: any) => {
    if (node.state === 'active') stats.active++;
    else if (node.state === 'archived') stats.archived++;
    else if (node.state === 'dead') stats.dead++;

    if (node.metadata?.size_bytes) {
      stats.totalSize += node.metadata.size_bytes;
    }

    if (node.cognitive_score !== null) {
      totalScore += node.cognitive_score;
      count++;
    }
  });

  stats.averageCognitiveScore = count > 0 ? totalScore / count : 0;

  return stats;
}

// Archive a memory node (upload to IPFS, then move from active to archived)
export async function archiveMemoryNode(nodeId: string): Promise<void> {
  try {
    // First, upload to IPFS before archiving
    const { data: node } = await supabase
      .from('memory_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (node) {
      // Upload to IPFS via edge function
      const { data: ipfsResult, error: ipfsError } = await supabase.functions.invoke('upload-to-ipfs', {
        body: {
          nodeId,
          data: node,
          metadata: node.metadata,
        },
      });

      if (ipfsError) {
        console.error('Failed to upload to IPFS:', ipfsError);
        // Continue with archiving even if IPFS upload fails
      } else {
        console.log('Successfully uploaded to IPFS:', ipfsResult);
      }
    }

    // Now update the database
    const { error } = await supabase
      .from('memory_nodes')
      .update({
        state: 'archived',
        archived_at: new Date().toISOString(),
        cognitive_score: 0.5,
        updated_at: new Date().toISOString()
      })
      .eq('id', nodeId)
      .eq('state', 'active');
    
    if (error) throw error;

    // Create transaction record
    await createTransaction('archive', nodeId);
  } catch (error) {
    console.error('Error in archiveMemoryNode:', error);
    throw error;
  }
}

// Promote a memory node (move from archived to active)
export async function promoteMemoryNode(nodeId: string): Promise<void> {
  const { error } = await supabase
    .from('memory_nodes')
    .update({
      state: 'active',
      cognitive_score: 0.8,
      access_count: 1,
      last_accessed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', nodeId)
    .eq('state', 'archived');
  
  if (error) throw error;

  // Create transaction record
  await createTransaction('promote', nodeId);
}

// Forget a memory node (upload to IPFS, then mark as dead)
export async function forgetMemoryNode(nodeId: string): Promise<void> {
  try {
    // First, upload to IPFS before forgetting
    const { data: node } = await supabase
      .from('memory_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (node) {
      // Upload to IPFS via edge function
      const { data: ipfsResult, error: ipfsError } = await supabase.functions.invoke('upload-to-ipfs', {
        body: {
          nodeId,
          data: node,
          metadata: node.metadata,
        },
      });

      if (ipfsError) {
        console.error('Failed to upload to IPFS:', ipfsError);
        // Continue with deletion even if IPFS upload fails
      } else {
        console.log('Successfully uploaded to IPFS:', ipfsResult);
      }
    }

    // Now mark as dead in database
    const { error } = await supabase
      .from('memory_nodes')
      .update({
        state: 'dead',
        deleted_at: new Date().toISOString(),
        cognitive_score: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', nodeId)
      .in('state', ['active', 'archived']);
    
    if (error) throw error;

    // Create transaction record
    await createTransaction('forget', nodeId);
  } catch (error) {
    console.error('Error in forgetMemoryNode:', error);
    throw error;
  }
}

// Create a transaction record
async function createTransaction(type: string, nodeId: string): Promise<void> {
  const transactionHash = generateTransactionHash();
  
  await supabase.from('transactions').insert({
    transaction_hash: transactionHash,
    from_address: 'system',
    to_address: nodeId,
    amount: 0,
    status: 'confirmed',
    gas_used: Math.floor(Math.random() * 50000 + 21000),
  });
}

// Generate a pseudo-transaction hash
function generateTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Format bytes to human-readable size
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format time ago
export function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
