/**
 * Share Handler Component
 * 
 * Handles shared content from other apps
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSharedData, isShareTarget, clearShareData } from '../../utils/share-handler';
import { useToast } from '../../context/ToastContext';

export function ShareHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showInfo } = useToast();

  useEffect(() => {
    if (isShareTarget()) {
      const sharedData = getSharedData();
      
      if (sharedData) {
        // Show info about shared content
        const message = sharedData.title || sharedData.text || 'Content shared';
        showInfo(`Shared: ${message}`);
        
        // Navigate to groups page (user can create expense from shared content)
        navigate('/groups');
        
        // Clear share parameters from URL
        clearShareData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
