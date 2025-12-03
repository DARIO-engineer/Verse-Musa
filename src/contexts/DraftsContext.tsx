import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Draft, DraftService } from '../services/DraftService';

interface DraftsContextProps {
  drafts: Draft[];
  refreshDrafts: () => Promise<void>;
  addDraftOptimistic: (newDraft: Draft) => void;
  updateDraftOptimistic: (updatedDraft: Draft) => void;
  deleteDraftOptimistic: (draftId: string) => void;
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
}

const DraftsContext = createContext<DraftsContextProps | undefined>(undefined);

export const useDrafts = () => {
  const context = useContext(DraftsContext);
  if (!context) throw new Error('useDrafts must be used within a DraftsProvider');
  return context;
};

export const DraftsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const refreshDrafts = useCallback(async () => {
    const fetchedDrafts = await DraftService.getAllDrafts();
    setDrafts(fetchedDrafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  }, []);

  const addDraftOptimistic = (newDraft: Draft) => {
    setDrafts(prevDrafts => [newDraft, ...prevDrafts]);
  };

  const updateDraftOptimistic = (updatedDraft: Draft) => {
    setDrafts(prevDrafts => {
      const index = prevDrafts.findIndex(d => d.id === updatedDraft.id);
      if (index !== -1) {
        const newDrafts = [...prevDrafts];
        newDrafts[index] = updatedDraft;
        return newDrafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      return [updatedDraft, ...prevDrafts]; // Add if not found
    });
  };

  const deleteDraftOptimistic = (draftId: string) => {
    setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draftId));
  };

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  return (
    <DraftsContext.Provider value={{ drafts, refreshDrafts, addDraftOptimistic, updateDraftOptimistic, deleteDraftOptimistic, setDrafts }}>
      {children}
    </DraftsContext.Provider>
  );
}; 