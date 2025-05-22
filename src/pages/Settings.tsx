import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CreditCard,
  Check,
  Plus,
  Trash2,
  Star
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
  expireDate: string;
  cvc: string;
  isDefault: boolean;
  type: 'visa' | 'mastercard' | 'amex';
  cardColor: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    { 
      id: 'card1', 
      name: 'Chase Sapphire', 
      cardNumber: '**** **** **** 4567', 
      expireDate: '05/27', 
      cvc: '***', 
      isDefault: true,
      type: 'visa',
      cardColor: 'bg-blue-500'
    },
    { 
      id: 'card2', 
      name: 'Citibank Premier', 
      cardNumber: '**** **** **** 8923', 
      expireDate: '11/26', 
      cvc: '***', 
      isDefault: false,
      type: 'mastercard',
      cardColor: 'bg-purple-500'
    },
    { 
      id: 'card3', 
      name: 'American Express', 
      cardNumber: '**** ****** 61005', 
      expireDate: '03/28', 
      cvc: '****', 
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground">Manage your payment cards and preferences</p>
          </div>

          {/* Payment Cards Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Cards</CardTitle>
                  <CardDescription>
                    Manage your connected payment cards. You can set a default card and add new ones.
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
                      className={`relative overflow-hidden rounded-lg p-4 border ${
                        card.isDefault ? 'ring-2 ring-primary' : ''
                      }`}
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
                              <p className="text-xs">CVC: {card.cvc}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
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

          {/* Additional Settings Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for transactions
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium">Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium">Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account information
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <AddCardDialog
            isOpen={isAddCardOpen}
            onClose={()=>setIsAddCardOpen(false)}
            onAddCard={handleAddCard} 
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;