import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, X, Loader2 } from "lucide-react";
import valid from 'card-validator';

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

interface AddCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: Omit<PaymentCard, 'id'>) => void;
  isLoading: boolean;
}

const cardColors = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-teal-500', label: 'Teal' },
];

// Map card-validator types to our card types
const mapCardType = (cardType: string): 'visa' | 'mastercard' | 'amex' | '' => {
  switch (cardType) {
    case 'visa':
      return 'visa';
    case 'mastercard':
      return 'mastercard';
    case 'american-express':
      return 'amex';
    default:
      return '';
  }
};

export const AddCardDialog: React.FC<AddCardDialogProps> = ({
  isOpen,
  onClose,
  onAddCard,
  isLoading,
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expireDate: '',
    cvc: '',
    type: '' as 'visa' | 'mastercard' | 'amex' | '',
    cardColor: 'bg-blue-500',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles input changes for form fields.
   * @param field - The name of the field being updated.
   * @param value - The new value for the field.
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Formats the card number input.
   * @param value - The raw card number input.
   * @returns The formatted card number.
   */
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted.substring(0, 19);
  };

  /**
   * Formats the expiry date input.
   * @param value - The raw expiry date input.
   * @returns The formatted expiry date.
   */
  const formatExpireDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    return cleaned;
  };

  /**
   * Handles changes to the card number input.
   * Formats the input, detects card type, and updates the form data.
   * @param value - The raw card number input.
   */
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const cleanedNumber = formatted.replace(/\s/g, '');
    
    // Detect card type using card-validator
    const cardValidation = valid.number(cleanedNumber);
    const detectedType = cardValidation.card ? mapCardType(cardValidation.card.type) : '';
    
    // Update form data with formatted number and detected type
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted,
      type: detectedType
    }));
    
    // Clear card number error if it exists
    if (errors.cardNumber) {
      setErrors(prev => ({
        ...prev,
        cardNumber: ''
      }));
    }
    
    // Clear type error if card type was detected
    if (detectedType && errors.type) {
      setErrors(prev => ({
        ...prev,
        type: ''
      }));
    }
  };

  /**
   * Handles changes to the expiry date input.
   * Formats the input and updates the form data.
   * @param value - The raw expiry date input.
   */
  const handleExpireDateChange = (value: string) => {
    const formatted = formatExpireDate(value);
    handleInputChange('expireDate', formatted);
  };

  /**
   * Validates the form data.
   * @returns {boolean} - Whether the form is valid.
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Card name is required';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else {
      // Validate card number using card-validator
      const cleanedNumber = formData.cardNumber.replace(/\s/g, '');
      const cardValidation = valid.number(cleanedNumber);
      
      if (!cardValidation.isValid) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
    }

    if (!formData.expireDate.trim()) {
      newErrors.expireDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expireDate)) {
      newErrors.expireDate = 'Expiry date must be in MM/YY format';
    } else {
      // Validate expiry date using card-validator
      const expirationValidation = valid.expirationDate(formData.expireDate);
      if (!expirationValidation.isValid) {
        newErrors.expireDate = 'Please enter a valid expiry date';
      }
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = 'CVC is required';
    } else {
      // Validate CVC using card-validator
      const cvcValidation = valid.cvv(formData.cvc);
      if (!cvcValidation.isValid) {
        newErrors.cvc = 'Please enter a valid CVC';
      }
    }

    if (!formData.type) {
      newErrors.type = 'Card type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission for adding a new card.
   * @param e - The form event.
   * @returns {void}
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show toast for invalid card number if that's the specific error
      if (errors.cardNumber && errors.cardNumber.includes('valid card number')) {
        toast({
          title: "Invalid Card Number",
          description: "The card number you entered is not valid. Please check and try again.",
          variant: "destructive",
        });
      }
      return;
    }

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    const maskedCardNumber = cardNumberDigits;

    const newCard: Omit<PaymentCard, 'id'> = {
      name: formData.name,
      cardNumber: maskedCardNumber,
      expireDate: formData.expireDate,
      cvc: formData.cvc,
      type: formData.type as 'visa' | 'mastercard' | 'amex',
      cardColor: formData.cardColor,
      isDefault: formData.isDefault,
    };

    onAddCard(newCard);
  };

  /**
   * Closes the dialog and resets the form.
   * @returns {void}
   */
  const handleClose = () => {
    if (isLoading) return;
    
    setFormData({
      name: '',
      cardNumber: '',
      expireDate: '',
      cvc: '',
      type: '',
      cardColor: 'bg-blue-500',
      isDefault: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <DialogTitle>
                {isLoading ? 'Saving...' : 'Add New Payment Card'}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription>
            {isLoading 
              ? 'Please wait while we securely save your card information.'
              : 'Add a new payment card to your account. All information is securely stored.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Card Name</Label>
            <Input
              id="cardName"
              placeholder="e.g., Chase Sapphire"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              maxLength={19}
              className={errors.cardNumber ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expireDate">Expiry Date</Label>
              <Input
                id="expireDate"
                placeholder="MM/YY"
                value={formData.expireDate}
                onChange={(e) => handleExpireDateChange(e.target.value)}
                maxLength={5}
                className={errors.expireDate ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.expireDate && (
                <p className="text-sm text-destructive">{errors.expireDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={formData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
                maxLength={4}
                className={errors.cvc ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.cvc && (
                <p className="text-sm text-destructive">{errors.cvc}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="amex">American Express</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardColor">Card Color</Label>
            <Select 
              value={formData.cardColor} 
              onValueChange={(value) => handleInputChange('cardColor', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card color" />
              </SelectTrigger>
              <SelectContent>
                {cardColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.value}`}></div>
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleInputChange('isDefault', checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as default payment card
            </Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Card'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};