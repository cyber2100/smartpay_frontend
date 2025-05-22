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
import { CreditCard, X } from "lucide-react";

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

export const AddCardDialog: React.FC<AddCardDialogProps> = ({
  isOpen,
  onClose,
  onAddCard,
}) => {
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  const formatExpireDate = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Add slash after month
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    handleInputChange('cardNumber', formatted);
  };

  const handleExpireDateChange = (value: string) => {
    const formatted = formatExpireDate(value);
    handleInputChange('expireDate', formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Card name is required';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.cardNumber = 'Card number must be at least 15 digits';
    }

    if (!formData.expireDate.trim()) {
      newErrors.expireDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expireDate)) {
      newErrors.expireDate = 'Expiry date must be in MM/YY format';
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = 'CVC is required';
    } else if (formData.cvc.length < 3) {
      newErrors.cvc = 'CVC must be at least 3 digits';
    }

    if (!formData.type) {
      newErrors.type = 'Card type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Mask the card number for display
    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    const maskedCardNumber = formData.type === 'amex' 
      ? `**** ****** ${cardNumberDigits.slice(-5)}`
      : `**** **** **** ${cardNumberDigits.slice(-4)}`;

    const newCard: Omit<PaymentCard, 'id'> = {
      name: formData.name,
      cardNumber: maskedCardNumber,
      expireDate: formData.expireDate,
      cvc: formData.type === 'amex' ? '****' : '***',
      type: formData.type as 'visa' | 'mastercard' | 'amex',
      cardColor: formData.cardColor,
      isDefault: formData.isDefault,
    };

    onAddCard(newCard);
    handleClose();
  };

  const handleClose = () => {
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
              <DialogTitle>Add New Payment Card</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Add a new payment card to your account. All information is securely stored.
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
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as default payment card
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};