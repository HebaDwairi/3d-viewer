import { useContext } from "react";
import AnnotationsContext from "../contexts/AnnotationsContext";

export const useAnnotations = () => {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error('useAnnotationsContext must be used within a AnnotationsContextProvider');
  }
  return context;
};