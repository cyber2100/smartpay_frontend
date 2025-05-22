import React, { useState } from 'react';
import { 
  ArrowLeft,
  CreditCard,
  Check,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddCardDialog } from '@/components/AddCardDialog';
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
  fullCardNumber: string; // Store the full card number
  expireDate: string;
  cvc: string;
  isDefault: boolean;
  type: 'visa' | 'mastercard' | 'amex';
  cardColor: string;
}

// Card Detail Modal Component
const CardDetailModal: React.FC<{
  card: PaymentCard;
  isOpen: boolean;
  onClose: () => void;
  onSetDefault: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}> = ({ card, isOpen, onClose, onSetDefault, onDelete }) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  if (!isOpen) return null;

  const formatCardNumber = (number: string, show: boolean) => {
    if (show) {
      // Format full card number with spaces
      return number.replace(/(.{4})/g, '$1 ').trim();
    }
    return card.cardNumber; // Return masked version
  };

  const formatCVC = (cvc: string, show: boolean) => {
    if (show) {
      return cvc;
    }
    return card.type === 'amex' ? '****' : '***';
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
            className={`relative p-6 rounded-xl text-white shadow-lg ${card.cardColor} mb-6`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="text-xl font-bold">{card.name}</div>
              <CreditCard className="h-8 w-8" />
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-75">Card Number</p>
                <p className="text-lg font-mono tracking-wider">
                  {formatCardNumber(card.fullCardNumber, showSensitiveInfo)}
                </p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm opacity-75">Expiry Date</p>
                  <p className="font-mono">{card.expireDate}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">CVC</p>
                  <p className="font-mono">{formatCVC('123', showSensitiveInfo)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              className="flex items-center gap-2"
            >
              {showSensitiveInfo ? (
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
              {card.isDefault ? (
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
                {card.type}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!card.isDefault && (
              <Button
                onClick={() => onSetDefault(card.id)}
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
                    Are you sure you want to delete "{card.name}"? This action cannot be undone.
                    {card.isDefault && (
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
                      onDelete(card.id);
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
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    { 
      id: 'card1', 
      name: 'Chase Sapphire', 
      cardNumber: '**** **** **** 4567',
      fullCardNumber: '4532123456784567',
      expireDate: '05/27', 
      cvc: '123', 
      isDefault: true,
      type: 'visa',
      cardColor: 'bg-blue-500'
    },
    { 
      id: 'card2', 
      name: 'Citibank Premier', 
      cardNumber: '**** **** **** 8923',
      fullCardNumber: '5412345678908923',
      expireDate: '11/26', 
      cvc: '456', 
      isDefault: false,
      type: 'mastercard',
      cardColor: 'bg-purple-500'
    },
    { 
      id: 'card3', 
      name: 'American Express', 
      cardNumber: '**** ****** 61005',
      fullCardNumber: '374245455400001',
      expireDate: '03/28', 
      cvc: '1234', 
      isDefault: false,
      type: 'amex',
      cardColor: 'bg-green-500'
    }
  ]);

  const handleSetDefault = (cardId: string) => {
    setPaymentCards(cards => 
      cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = paymentCards.find(card => card.id === cardId);
    if (cardToDelete?.isDefault && paymentCards.length > 1) {
      // If deleting default card, set another card as default
      const otherCard = paymentCards.find(card => card.id !== cardId);
      if (otherCard) {
        setPaymentCards(cards => 
          cards.filter(card => card.id !== cardId)
            .map(card => ({
              ...card,
              isDefault: card.id === otherCard.id
            }))
        );
      }
    } else {
      setPaymentCards(cards => cards.filter(card => card.id !== cardId));
    }
  };

  const handleAddCard = (newCard: Omit<PaymentCard, 'id'>) => {
    const cardId = `card${Date.now()}`;
    const cardWithId: PaymentCard = {
      ...newCard,
      id: cardId
    };
    
    // If this is the first card or set as default, make it default
    if (paymentCards.length === 0 || newCard.isDefault) {
      setPaymentCards(cards => [
        ...cards.map(card => ({ ...card, isDefault: false })),
        cardWithId
      ]);
    } else {
      setPaymentCards(cards => [...cards, cardWithId]);
    }
  };

  const getCardTypeIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

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
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
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
                  <Button onClick={() => setIsAddCardOpen(true)}>
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
                      }`}
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
                              className="flex items-center gap-1"
                            >
                              <Star className="h-3 w-3" />
                              Set Default
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
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