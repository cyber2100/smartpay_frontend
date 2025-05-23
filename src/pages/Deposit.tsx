import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useCard } from "@/hooks/use-card";
import { ArrowRight, CheckCircle2, CreditCard, DollarSign, Shield } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PaymentCard } from "@/types/payment";

interface DepositFormData {
  cardId: string;
  amount: string;
}

const Deposit: React.FC = () => {
  // Mock auth and wallet for demo
  const { user, isAuthenticated } = useAuth();
  const { deposit: walletDeposit } = useWallet();
  const { balance } = useWallet();
  const { cards: paymentCards, getCards } = useCard();
  const navigate = useNavigate();

  const deposit = async (cardId: string, amount: number) => {
    // Mock deposit function
    const response = await walletDeposit(cardId, amount);
    return response;
  };
  
  const toast = ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description} - ${variant || 'default'}`);
  };

  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);

  useEffect(() => {
    getCards();
  }, [])

  // Remove navigation logic for demo
  useEffect(() => {
    // Mock authentication check
    if (!user?.isVerified) {
      navigate('/verify');
    }
    
    // Set default card
    const defaultCard = paymentCards.find(card => card.isDefault);
    if (defaultCard) {
      setSelectedCardId(defaultCard.id);
      setSelectedCard(defaultCard);
    }
  }, []);

  // Convert amount to a number for validation
  const amountValue: number = parseFloat(amount);
  const minDeposit = 10;
  const maxDeposit = 10000;

  const validateStep1 = (): boolean => {
    // Validate amount
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return false;
    }

    if (amountValue < minDeposit) {
      toast({
        title: "Amount too low",
        description: `Minimum deposit amount is $${minDeposit}.`,
        variant: "destructive",
      });
      return false;
    }

    if (amountValue > maxDeposit) {
      toast({
        title: "Amount too high",
        description: `Maximum deposit amount is $${maxDeposit}.`,
        variant: "destructive",
      });
      return false;
    }

    // Validate card selection
    if (!selectedCardId) {
      toast({
        title: "No card selected",
        description: "Please select a payment card.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();

    // Step 1: Validate inputs and proceed to confirmation
    if (step === 1) {
      if (!validateStep1()) {
        return;
      }

      const card = paymentCards.find(c => c.id === selectedCardId);
      setSelectedCard(card || null);
      setStep(2);
      return;
    }

    // Step 2: Process the deposit
    if (step === 2) {
      setIsSubmitting(true);
      
      try {
        const success = await deposit(selectedCardId, amountValue);
        if (success) {
          setDepositSuccess(true);
          setStep(3);
          toast({
            title: "Deposit successful",
            description: `$${amountValue.toFixed(2)} has been added to your wallet.`,
          });
        }
      } catch (error) {
        console.error("Deposit error:", error);
        toast({
          title: "Deposit failed",
          description: "There was an error processing your deposit. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = (): void => {
    setStep(1);
    setAmount("");
    setDepositSuccess(false);
    setSelectedCard(null);
    // Reset to default card
    const defaultCard = paymentCards.find(card => card.isDefault);
    if (defaultCard) {
      setSelectedCardId(defaultCard.id);
    }
  };

  const handleCardSelect = (cardId: string): void => {
    setSelectedCardId(cardId);
    const card = paymentCards.find(c => c.id === cardId);
    setSelectedCard(card || null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleBackToStep1 = (): void => {
    setStep(1);
  };

  const handleNavigateToWallet = (): void => {
    navigate('/wallet');
    console.log('Navigate to wallet');
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardTypeName = (type: string) => {
    switch (type) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      default:
        return 'Card';
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber <= step ? 'bg-primary text-primary-foreground' : 
                'bg-muted text-muted-foreground'
              }`}>
                {stepNumber < step || (stepNumber === 3 && depositSuccess) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`ml-2 text-sm ${
                stepNumber <= step ? 'text-foreground font-medium' : 
                'text-muted-foreground'
              }`}>
                {stepNumber === 1 && 'Details'}
                {stepNumber === 2 && 'Confirm'}
                {stepNumber === 3 && 'Complete'}
              </span>
            </div>
            {stepNumber < 3 && (
              <div className={`w-8 h-px ml-4 ${
                stepNumber < step || (stepNumber === 2 && depositSuccess) ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-400 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="container px-4 pt-8 relative z-10">
        <div className="max-w-lg mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
          <div className="text-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {depositSuccess ? "Deposit Complete" : "Add Money"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {depositSuccess
                ? "Your money has been added successfully."
                : "Deposit funds to your SmartPay wallet."}
            </p>
          </div>

          <div className="p-6">
            <StepIndicator />

            {/* Current Balance Display */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  ${balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            
            {depositSuccess ? (
              <div className="flex flex-col items-center py-6">
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  Deposit successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your money has been added to your wallet.
                </p>

                <div className="w-full p-4 rounded-lg bg-muted/50 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Amount Deposited</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      +${amountValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold">
                      {selectedCard && `${getCardTypeName(selectedCard.type)} ${selectedCard.cardNumber}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Balance</span>
                    <span className="font-semibold">
                      ${(balance + amountValue).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleReset}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    New Deposit
                  </button>
                  <button 
                    onClick={handleNavigateToWallet}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Back to Wallet
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Deposit Amount ($)
                      </label>
                      <input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        min={minDeposit}
                        max={maxDeposit}
                        step="any"
                        value={amount}
                        onChange={handleAmountChange}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: ${minDeposit} • Max: ${maxDeposit.toLocaleString()}
                      </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium leading-none">
                        Select Payment Method
                      </label>
                      <div className="space-y-2">
                        {paymentCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => handleCardSelect(card.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedCardId === card.id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-input hover:border-primary/50 hover:bg-accent/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {getCardIcon(card.type)}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {getCardTypeName(card.type)} {card.cardNumber}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {card.name} • {card.expireDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {card.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  selectedCardId === card.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}>
                                  {selectedCardId === card.id && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleSubmit()}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Confirm Deposit
                      </h3>

                      {selectedCard && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md mb-4">
                          <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {getCardIcon(selectedCard.type)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getCardTypeName(selectedCard.type)} {selectedCard.cardNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCard.name}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deposit Amount</span>
                          <span className="font-semibold text-lg">
                            ${amountValue.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processing Fee</span>
                          <span className="font-semibold text-green-600">
                            Free
                          </span>
                        </div>

                        <hr className="border-muted" />

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-bold text-lg">
                            ${amountValue.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Balance</span>
                          <span className="font-bold text-primary">
                            ${(balance + amountValue).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleBackToStep1}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
                      >
                        {isSubmitting ? (
                          "Processing Deposit..."
                        ) : (
                          <span className="flex items-center gap-1">
                            Confirm Deposit <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;