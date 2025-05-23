import React, { useState, useEffect } from 'react';
import { 
  CreditCard,
  Check,
  Trash2,
  Star,
  Eye,
  EyeOff,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCard } from "@/hooks/use-card";
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
import { PaymentCard } from '@/types/payment';

interface CardDetailModalProps {
  card: PaymentCard;
  isOpen: boolean;
  onClose: () => void;
  onSetDefault: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ 
  card, 
  isOpen, 
  onClose, 
  onSetDefault, 
  onDelete 
}) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [cardDetails, setCardDetails] = useState<PaymentCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getCardDetails } = useCard();

  useEffect(() => {
    if (isOpen && card) {
      setCardDetails(card);
    }
  }, [isOpen, card]);

  const handleShowSensitiveInfo = async () => {
    if (!showSensitiveInfo && cardDetails) {
      setIsLoading(true);
      try {
        const fullCardDetails = await getCardDetails(cardDetails.id);
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
    if (show && cardDetails.cardNumber) {
      return cardDetails.cardNumber.replace(/(.{4})/g, '$1 ').trim();
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
                  {formatCardNumber(cardDetails.cardNumber || cardDetails.cardNumber, showSensitiveInfo)}
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