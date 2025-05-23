import React from 'react';
import { 
  CreditCard,
  Check,
  Trash2,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface CardListItemProps {
  card: PaymentCard;
  isLoading: boolean;
  onClick: () => void;
  onSetDefault: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  totalCards: number;
}

export const CardListItem: React.FC<CardListItemProps> = ({
  card,
  isLoading,
  onClick,
  onSetDefault,
  onDelete,
  totalCards
}) => {
  const getCardTypeIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md ${
        card.isDefault ? 'ring-2 ring-primary' : ''
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
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
              onClick={() => onSetDefault(card.id)}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? (
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
                disabled={isLoading}
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
                  {card.isDefault && totalCards > 1 && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      This is your default card. Another card will be set as default.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(card.id)}
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
  );
};