import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  CreditCard,
  Check,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  X,
  Loader2
} from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddCardDialog } from '@/components/AddCardDialog';
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface PaymentCard {
  id: string;
  name: string;
  cardNumber: string;
  fullCardNumber: string;
  expireDate: string;
  cvc: string;
  isDefault: boolean;
  type: 'visa' | 'mastercard' | 'amex';
  cardColor: string;
}

// API Service Functions
const cardApi = {
  // Get all cards
  getCards: async (): Promise<PaymentCard[]> => {
    try {
      const response = await fetch('/api/cards', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  // Add new card
  addCard: async (cardData: Omit<PaymentCard, 'id'>): Promise<PaymentCard> => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add card');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },

  // Update card (set as default)
  updateCard: async (cardId: string, updateData: Partial<PaymentCard>): Promise<PaymentCard> => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update card');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  // Set card as default
  setDefaultCard: async (cardId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${cardId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default card');
      }
    } catch (error) {
      console.error('Error setting default card:', error);
      throw error;
    }
  },

  // Delete card
  deleteCard: async (cardId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  // Get card details (including sensitive info)
  getCardDetails: async (cardId: string): Promise<PaymentCard> => {
    try {
      const response = await fetch(`/api/cards/${cardId}/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch card details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching card details:', error);
      throw error;
    }
  },
};

// Card Detail Modal Component
const CardDetailModal: React.FC<{
  card: PaymentCard;
  isOpen: boolean;
  onClose: () => void;
  onSetDefault: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}> = ({ card, isOpen, onClose, onSetDefault, onDelete }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [cardDetails, setCardDetails] = useState<PaymentCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && card) {
      setCardDetails(card);
    }
  }, [isOpen, card]);

  const handleShowSensitiveInfo = async () => {
    if (!showSensitiveInfo && cardDetails) {
      setIsLoading(true);
      try {
        const fullCardDetails = await cardApi.getCardDetails(cardDetails.id);
        setCardDetails(fullCardDetails);
        setShowSensitiveInfo(true);
        toast({
          title: "Card details revealed",
          description: "Full card information is now visible.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load card details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowSensitiveInfo(false);
    }
  };

  if (!isOpen || !cardDetails) return null;

  const formatCardNumber = (number: string, show: boolean) => {
    if (show && cardDetails.fullCardNumber) {
      return cardDetails.fullCardNumber.replace(/(.{4})/g, '$1 ').trim();
    }
    return cardDetails.cardNumber;
  };

  const formatCVC = (cvc: string, show: boolean) => {
    if (show && cardDetails.cvc) {
      return cardDetails.cvc;
    }
    return cardDetails.type === 'amex' ? '****' : '***';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Card Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Card Visual */}
        <div className="p-6">
          <div 
            className={`relative p-6 rounded-xl text-white shadow-lg ${cardDetails.cardColor} mb-6`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="text-xl font-bold">{cardDetails.name}</div>
              <CreditCard className="h-8 w-8" />
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-75">Card Number</p>
                <p className="text-lg font-mono tracking-wider">
                  {formatCardNumber(cardDetails.fullCardNumber || cardDetails.cardNumber, showSensitiveInfo)}
                </p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm opacity-75">Expiry Date</p>
                  <p className="font-mono">{cardDetails.expireDate}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">CVC</p>
                  <p className="font-mono">{formatCVC(cardDetails.cvc, showSensitiveInfo)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              onClick={handleShowSensitiveInfo}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : showSensitiveInfo ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>

          {/* Card Status */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Default Card</span>
              {cardDetails.isDefault ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Card Type</span>
              <Badge variant="outline" className="capitalize">
                {cardDetails.type}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!cardDetails.isDefault && (
              <Button
                onClick={() => onSetDefault(cardDetails.id)}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Star className="h-4 w-4" />
                Set as Default Card
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Card
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Payment Card</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{cardDetails.name}"? This action cannot be undone.
                    {cardDetails.isDefault && (
                      <span className="block mt-2 text-orange-600 font-medium">
                        This is your default card. Another card will be set as default.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(cardDetails.id);
                      onClose();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Card
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardPage: React.FC = () => {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load cards on component mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const cards = await cardApi.getCards();
      setPaymentCards(cards);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your cards. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    setIsProcessing(true);
    try {
      await cardApi.setDefaultCard(cardId);
      
      // Update local state
      setPaymentCards(cards => 
        cards.map(card => ({
          ...card,
          isDefault: card.id === cardId
        }))
      );

      toast({
        title: "Success",
        description: "Default card updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setIsProcessing(true);
    try {
      await cardApi.deleteCard(cardId);
      
      const cardToDelete = paymentCards.find(card => card.id === cardId);
      
      // Update local state
      if (cardToDelete?.isDefault && paymentCards.length > 1) {
        // If deleting default card, the backend should handle setting a new default
        // Reload cards to get the updated default status
        await loadCards();
      } else {
        setPaymentCards(cards => cards.filter(card => card.id !== cardId));
      }

      toast({
        title: "Success",
        description: "Card deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = async (newCard: Omit<PaymentCard, 'id'>) => {
    setIsProcessing(true);
    try {
      const addedCard = await cardApi.addCard(newCard);
      
      // Update local state
      if (newCard.isDefault || paymentCards.length === 0) {
        setPaymentCards(cards => [
          ...cards.map(card => ({ ...card, isDefault: false })),
          addedCard
        ]);
      } else {
        setPaymentCards(cards => [...cards, addedCard]);
      }

      toast({
        title: "Success",
        description: "Card added successfully.",
      });
      
      setIsAddCardOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add card. Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardTypeIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Payment Cards</h1>
            <p className="text-muted-foreground">Manage your payment cards</p>
          </div>

          {/* Payment Cards Section */}
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
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentCards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No cards added</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first payment card to get started
                  </p>
                  <Button 
                    onClick={() => setIsAddCardOpen(true)}
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentCards.map((card) => (
                    <div 
                      key={card.id} 
                      className={`relative overflow-hidden rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md ${
                        card.isDefault ? 'ring-2 ring-primary' : ''
                      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => setSelectedCard(card)}
                    >
                      <div className={`absolute top-0 left-0 h-full w-2 ${card.cardColor}`}></div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-background">
                            {getCardTypeIcon(card.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{card.name}</p>
                              {card.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Default
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                            <div className="flex gap-4 mt-1">
                              <p className="text-xs">Exp: {card.expireDate}</p>
                              <p className="text-xs">CVC: ***</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!card.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(card.id)}
                              disabled={isProcessing}
                              className="flex items-center gap-1"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Star className="h-3 w-3" />
                              )}
                              Set Default
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Payment Card</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{card.name}"? This action cannot be undone.
                                  {card.isDefault && paymentCards.length > 1 && (
                                    <span className="block mt-2 text-orange-600 font-medium">
                                      This is your default card. Another card will be set as default.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCard(card.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete Card
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <AddCardDialog
            isOpen={isAddCardOpen}
            onClose={() => setIsAddCardOpen(false)}
            onAddCard={handleAddCard}
            isLoading={isProcessing}
          />

          {/* Card Detail Modal */}
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