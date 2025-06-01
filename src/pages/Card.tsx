import React, { useEffect, useState } from 'react';
import { 
  CreditCard,
  Plus,
  Loader2
} from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddCardDialog } from '@/components/AddCardDialog';
import { useCard } from "@/hooks/use-card";
import { useAuth } from "@/hooks/use-auth";
import { CardDetailModal } from '@/components/CardDetailModal';
import { CardListItem } from '@/components/CardListItem';
import { PaymentCard } from '@/types/payment';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const CardPage: React.FC = () => {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const { 
    cards, 
    isLoading, 
    addCard, 
    setDefaultCard, 
    deleteCard,
  } = useCard();

  /**
   * Sets the default card.
   * @param cardId - The ID of the card to set as default.
   */
  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultCard(cardId);
    } catch (error) {
      toast({ description: "Failed to set default card. Please try again." });
    }
  };

  /**
   * Deletes a payment card.
   * @param cardId - The ID of the card to delete.
   */
  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
    } catch (error) {
      toast({ description: "Failed to delete card. Please try again." });
    }
  };

  /**
   * Handles the addition of a new payment card.
   * @param newCard - The new card information.
   */
  const handleAddCard = async (newCard: Omit<PaymentCard, 'id'>) => {
    try {
      await addCard(newCard);
      setIsAddCardOpen(false);
    } catch (error) {
      toast({ description: "Failed to add card. Please try again." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        <div className="container px-4 pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Payment Cards</h1>
            <p className="text-muted-foreground">Manage your payment cards</p>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Cards</CardTitle>
                  <CardDescription>
                    Add, remove, and manage your payment cards. Click on a card to view details.
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddCardOpen(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No cards added</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first payment card to get started
                  </p>
                  <Button 
                    onClick={() => setIsAddCardOpen(true)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <CardListItem
                      key={card.id}
                      card={card}
                      isLoading={isLoading}
                      onClick={() => setSelectedCard(card)}
                      onSetDefault={handleSetDefault}
                      onDelete={handleDeleteCard}
                      totalCards={cards.length}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <AddCardDialog
            isOpen={isAddCardOpen}
            onClose={() => setIsAddCardOpen(false)}
            onAddCard={handleAddCard}
            isLoading={isLoading}
          />
          {selectedCard && (
            <CardDetailModal
              card={selectedCard}
              isOpen={!!selectedCard}
              onClose={() => setSelectedCard(null)}
              onSetDefault={handleSetDefault}
              onDelete={handleDeleteCard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CardPage;