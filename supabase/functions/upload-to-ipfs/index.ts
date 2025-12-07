import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  nodeId: string;
  data: any;
  metadata?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pinataJWT = Deno.env.get('PINATA_JWT')!;

    if (!pinataJWT) {
      throw new Error('PINATA_JWT not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { nodeId, data, metadata }: UploadRequest = await req.json();

    console.log('Uploading to IPFS:', { nodeId, dataSize: JSON.stringify(data).length });

    // Fetch the memory node data
    const { data: node, error: nodeError } = await supabase
      .from('memory_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError || !node) {
      throw new Error(`Memory node not found: ${nodeId}`);
    }

    // Prepare data for IPFS
    const ipfsData = {
      nodeId,
      nodeAddress: node.node_address,
      blockId: node.block_id,
      state: node.state,
      cognitiveScore: node.cognitive_score,
      accessCount: node.access_count,
      createdAt: node.created_at,
      archivedAt: node.archived_at,
      metadata: node.metadata,
      data: data || {},
      uploadedAt: new Date().toISOString(),
    };

    // Upload to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: ipfsData,
        pinataMetadata: {
          name: `memory-node-${nodeId}`,
          keyvalues: {
            nodeId,
            state: node.state,
            timestamp: new Date().toISOString(),
          },
        },
      }),
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata upload failed:', errorText);
      throw new Error(`Pinata upload failed: ${errorText}`);
    }

    const pinataResult = await pinataResponse.json();
    const ipfsHash = pinataResult.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('Successfully uploaded to IPFS:', { ipfsHash, ipfsUrl });

    // Update memory node with IPFS hash
    const { error: updateError } = await supabase
      .from('memory_nodes')
      .update({
        metadata: {
          ...(node.metadata || {}),
          ipfs_hash: ipfsHash,
          ipfs_url: ipfsUrl,
          ipfs_uploaded_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', nodeId);

    if (updateError) {
      console.error('Failed to update node with IPFS hash:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ipfsHash,
        ipfsUrl,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in upload-to-ipfs:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
