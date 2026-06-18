import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface CommentAuthorValue {
  displayName: string;
}

const defaultValue: CommentAuthorValue = { displayName: "Professional" };

const CommentAuthorContext = createContext<CommentAuthorValue>(defaultValue);

export function CommentAuthorProvider({
  children,
  displayName = "Professional",
}: {
  children: ReactNode;
  displayName?: string;
}) {
  const value = useMemo(() => ({ displayName }), [displayName]);
  return (
    <CommentAuthorContext.Provider value={value}>
      {children}
    </CommentAuthorContext.Provider>
  );
}

export function useCommentAuthor(): CommentAuthorValue {
  return useContext(CommentAuthorContext);
}
