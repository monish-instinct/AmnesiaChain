import { apiClient, ContractInteractionResult } from './api-client';
import { useToast } from '@/hooks/use-toast';

export const archiveDataOnChain = async (
  userWallet: string,
  dataId: string,
  dataHash: string,
  sizeBytes: number
): Promise<ContractInteractionResult> => {
  return apiClient.archiveDataOnChain(userWallet, dataId, dataHash, sizeBytes);
};

export const promoteDataOnChain = async (
  userWallet: string,
  dataId: string,
  dataHash: string
): Promise<ContractInteractionResult> => {
  return apiClient.promoteDataOnChain(userWallet, dataId, dataHash);
};

export const forgetDataOnChain = async (
  userWallet: string,
  dataId: string,
  dataHash: string,
  reason: string
): Promise<ContractInteractionResult> => {
  return apiClient.forgetDataOnChain(userWallet, dataId, dataHash, reason);
};
