-- Create enum types for memory states
CREATE TYPE public.memory_state AS ENUM ('active', 'archived', 'dead');
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'validator');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create memory_blocks table
CREATE TABLE public.memory_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index BIGINT NOT NULL UNIQUE,
  previous_hash TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  data JSONB NOT NULL,
  nonce BIGINT NOT NULL,
  cognitive_weight NUMERIC(10, 4) DEFAULT 0.5,
  state memory_state DEFAULT 'active' NOT NULL,
  validator_address TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.memory_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view memory blocks"
  ON public.memory_blocks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert memory blocks"
  ON public.memory_blocks FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create memory_nodes table
CREATE TABLE public.memory_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.memory_blocks(id) ON DELETE CASCADE NOT NULL,
  node_address TEXT NOT NULL,
  state memory_state DEFAULT 'active' NOT NULL,
  access_count BIGINT DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  cognitive_score NUMERIC(10, 4) DEFAULT 1.0,
  archived_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.memory_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view memory nodes"
  ON public.memory_nodes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert memory nodes"
  ON public.memory_nodes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update memory nodes"
  ON public.memory_nodes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  block_id UUID REFERENCES public.memory_blocks(id) ON DELETE CASCADE,
  amount NUMERIC(20, 8) NOT NULL,
  gas_used BIGINT,
  transaction_hash TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transactions"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create cognitive_metrics table
CREATE TABLE public.cognitive_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.memory_blocks(id) ON DELETE CASCADE NOT NULL,
  importance_score NUMERIC(10, 4) DEFAULT 0.5,
  recency_score NUMERIC(10, 4) DEFAULT 1.0,
  access_frequency BIGINT DEFAULT 0,
  decay_rate NUMERIC(10, 4) DEFAULT 0.1,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.cognitive_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cognitive metrics"
  ON public.cognitive_metrics FOR SELECT
  USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_memory_nodes_updated_at
  BEFORE UPDATE ON public.memory_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_memory_blocks_state ON public.memory_blocks(state);
CREATE INDEX idx_memory_blocks_created_by ON public.memory_blocks(created_by);
CREATE INDEX idx_memory_nodes_block_id ON public.memory_nodes(block_id);
CREATE INDEX idx_memory_nodes_state ON public.memory_nodes(state);
CREATE INDEX idx_transactions_block_id ON public.transactions(block_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_cognitive_metrics_block_id ON public.cognitive_metrics(block_id);