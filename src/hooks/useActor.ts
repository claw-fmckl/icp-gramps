import { useMemo } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '../declarations/icp-gramps.did';
import type { _SERVICE } from '../declarations/icp-gramps';

export function useActor() {
  return useMemo(() => {
    const canisterId = import.meta.env.VITE_CANISTER_ID_ICP_GRAMPS;
    
    if (!canisterId) {
      throw new Error('VITE_CANISTER_ID_ICP_GRAMPS environment variable is not set');
    }

    const agent = new HttpAgent({
      host: import.meta.env.VITE_IC_HOST || 'http://localhost:4943',
    });

    // Fetch root key for local development
    if (import.meta.env.DEV) {
      agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check if the local replica is running');
        console.error(err);
      });
    }

    return Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId,
    });
  }, []);
}
