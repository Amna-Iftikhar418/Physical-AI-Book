import { createContext, useContext } from 'react';

export interface DocOverrideCtx {
  handlePersonalize: (text: string) => void;
  handleTranslate: (text: string) => void;
  docId: string;
}

export const DocOverrideContext = createContext<DocOverrideCtx | null>(null);
export const useDocOverride = () => useContext(DocOverrideContext);
