import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cardService } from "@/services/api";
import { PaymentCard } from '@/types/payment';
import { useAuth } from "./use-auth";

// Types
type CardContextType = {
  cards: PaymentCard[];
  isLoading: boolean;
  addCard: (cardData: Omit<PaymentCard, 'id'>) => Promise<boolean>;
  updateCard: (cardId: string, updateData: Partial<PaymentCard>) => Promise<PaymentCard>;
  setDefaultCard: (cardId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getCards: () => Promise<PaymentCard[]>;
  refreshCards: () => Promise<void>;
};

// Context
const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load cards on mount
  useEffect(() => {
    if(isAuthenticated && user?.isVerified){
      refreshCards();
    } else {
      setCards([]);
    }
  }, [isAuthenticated, user?.isVerified]);

  // Refresh cards from API
  const refreshCards = async (): Promise<void> => {
    if(!isAuthenticated || !user?.isVerified) return;
    setIsLoading(true);
    try {
      const fetchedCards = await cardService.getCards();
      setCards(fetchedCards);
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to load your cards. Please refresh the page.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all cards
  const getCards = async (): Promise<PaymentCard[]> => {
    try {
      setIsLoading(true);
      const fetchedCards = await cardService.getCards();
      setCards(fetchedCards);
      return fetchedCards;
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail?.msg || "Failed to load your cards.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add new card
  const addCard = async (cardData: Omit<PaymentCard, 'id'>): Promise<boolean> => {
    try {
      await cardService.addCard(cardData);

      await getCards();

      toast({
        title: "Success",
        description: "Card added successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding card:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail?.msg || "Failed to add card. Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update card
  const updateCard = async (cardId: string, updateData: Partial<PaymentCard>): Promise<PaymentCard> => {
    try {
      const updatedCard = await cardService.updateCard(cardId, updateData);
      
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
      );

      toast({
        title: "Success",
        description: "Card updated successfully.",
      });

      return updatedCard;
    } catch (error: any) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail?.msg || "Failed to update card. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set card as default
  const setDefaultCard = async (cardId: string): Promise<void> => {
    try {
      await cardService.setDefaultCard(cardId);
      
      setCards(prevCards =>
        prevCards.map(card => ({
          ...card,
          isDefault: card.id === cardId
        }))
      );

      toast({
        title: "Success",
        description: "Default card updated successfully.",
      });
    } catch (error: any) {
      console.error('Error setting default card:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail?.msg || "Failed to set default card. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete card
  const deleteCard = async (cardId: string): Promise<void> => {
    try {
      await cardService.deleteCard(cardId);
      
      const cardToDelete = cards.find(card => card.id === cardId);
      
      if (cardToDelete?.isDefault && cards.length > 1) {
        await refreshCards();
      } else {
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      }

      toast({
        title: "Success",
        description: "Card deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting card:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail?.msg || "Failed to delete card. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    cards,
    isLoading,
    addCard,
    updateCard,
    setDefaultCard,
    deleteCard,
    getCards,
    refreshCards,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

// Hook to use the card context
export const useCard = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error("useCard must be used within a CardProvider");
  }
  return context;
};