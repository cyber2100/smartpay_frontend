import { ArrowRight, CheckCircle2, Search, User, CreditCard, Check } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Type definitions
interface PaymentCard {
  id: string;
  name: string;
  cardNumber: string;
  expireDate: string;
  cvc: string;
  isDefault: boolean;
  type: 'visa' | 'mastercard' | 'amex';
  cardColor: string;
}

interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TransferFormData {
  recipient: string;
  amount: string;
  description: string;
}

const Transfer: React.FC = () => {
  // Mock auth and wallet for demo
  const user = { name: 'Demo User' };
  const isAuthenticated = true;
  const balance = 5000;
  const navigate = useNavigate();

  const transfer = async (recipient: string, amount: number, description: string) => {
    // Mock transfer function
    return true;
  };
  
  const toast = ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description}`);
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  
  // User search states
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  
  // Card selection states
  const [showCardDialog, setShowCardDialog] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<string>("");
  
  // Mock user data for search
  const mockUsers: UserSuggestion[] = [
    { id: '1', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '2', name: 'John Doe', email: 'john@example.com' },
    { id: '3', name: 'Alex Johnson', email: 'alex.johnson@email.com' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@email.com' },
    { id: '5', name: 'Mike Chen', email: 'mike.chen@email.com' },
    { id: '6', name: 'Emily Rodriguez', email: 'emily.rodriguez@email.com' },
  ];

  // Mock payment cards
  const paymentCards: PaymentCard[] = [
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
  ];

  // Set default card on mount
  useEffect(() => {
    const defaultCard = paymentCards.find(card => card.isDefault);
    if (defaultCard) {
      setSelectedCard(defaultCard.id);
    }
  }, []);

  // Remove navigation logic for demo
  useEffect(() => {
    // Mock authentication check
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search users based on input
  const searchUsers = (query: string): UserSuggestion[] => {
    if (!query.trim()) return [];
    
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Convert amount to a number for validation
  const amountValue: number = parseFloat(amount);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate amount
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate recipient
    if (!recipient) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a recipient email or phone number.",
        variant: "destructive",
      });
      return;
    }

    // Step 1 is for details, step 2 is for confirmation
    if (step === 1) {
      setStep(2);
      return;
    }

    // Open the card selection dialog instead of proceeding directly
    setShowCardDialog(true);
  };

  const handleReset = (): void => {
    setStep(1);
    setRecipient("");
    setAmount("");
    setDescription("");
    setTransferSuccess(false);
    setSelectedUser(null);
    setShowDropdown(false);
  };

  const handleCardSelect = async (option: 'selected' | 'instant'): Promise<void> => {
    setShowCardDialog(false);
    setIsSubmitting(true);

    try {
      if (option === 'instant') {
        // Process the transfer directly
        const success = await transfer(recipient, amountValue, description);
        if (success) {
          setTransferSuccess(true);
        }
      } else {
        // In a real app, you'd process with the selected card
        const selectedCardData = paymentCards.find(card => card.id === selectedCard);
        setTimeout(() => {
          toast({
            title: `Processing with ${selectedCardData?.name}`,
            description: "Your transfer is being processed.",
          });
          setTransferSuccess(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer failed",
        description: "There was an error processing your transfer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setRecipient(value);
    
    if (value.trim()) {
      const results = searchUsers(value);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
      setSelectedUser(null);
    }
  };

  const handleUserSelect = (user: UserSuggestion): void => {
    setSelectedUser(user);
    setRecipient(user.email);
    setShowDropdown(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setDescription(e.target.value);
  };

  const handleBackToStep1 = (): void => {
    setStep(1);
  };

  const handleNavigateToWallet = (): void => {
    // Mock navigation
    console.log('Navigate to wallet');
    navigate('/wallet');
  };

  const handleCardDialogClose = (open: boolean): void => {
    setShowCardDialog(open);
  };

  const handleCardChange = (value: string): void => {
    setSelectedCard(value);
  };

  const handleProceedWithCard = (): void => {
    handleCardSelect("selected");
  };

  const handleInstantPayment = (): void => {
    handleCardSelect("instant");
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber <= step ? 'bg-primary text-primary-foreground' : 
                stepNumber === step + 1 && transferSuccess ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {stepNumber < step || (stepNumber === 3 && transferSuccess) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`ml-2 text-sm ${
                stepNumber <= step ? 'text-foreground font-medium' : 
                stepNumber === step + 1 && transferSuccess ? 'text-foreground font-medium' :
                'text-muted-foreground'
              }`}>
                {stepNumber === 1 && 'Details'}
                {stepNumber === 2 && 'Confirm'}
                {stepNumber === 3 && 'Complete'}
              </span>
            </div>
            {stepNumber < 3 && (
              <div className={`w-8 h-px ${
                stepNumber < step || (stepNumber === 2 && transferSuccess) ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="container px-4 pt-8 relative z-10">
        <div className="max-w-lg mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
          <div className="text-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {transferSuccess ? "Transfer Complete" : "Send Money"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {transferSuccess
                ? "Your money has been sent successfully."
                : "Transfer funds to another SmartPay user."}
            </p>
          </div>

          <div className="p-6">
            <StepIndicator />
            
            {transferSuccess ? (
              <div className="flex flex-col items-center py-6">
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  Transfer successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your money has been sent.
                </p>

                <div className="w-full p-4 rounded-lg bg-muted/50 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">
                      ${amountValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-semibold">{selectedUser?.name || recipient}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-semibold">{description}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleReset}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    New Transfer
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
                  <div className="space-y-4">
                    <div className="space-y-2 relative" ref={dropdownRef}>
                      <label htmlFor="recipient" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Recipient Email or Phone
                      </label>
                      <div className="relative">
                        <input
                          id="recipient"
                          type="text"
                          placeholder="Search users or enter email/phone"
                          value={recipient}
                          onChange={handleRecipientChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                          required
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {/* User dropdown */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedUser && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium">{selectedUser.name}</span>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{selectedUser.email}</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Demo recipients: jane@example.com or john@example.com
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount ($)</label>
                      <input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        min="1"
                        step="any"
                        value={amount}
                        onChange={handleAmountChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Your balance: $
                        {balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Description (optional)
                      </label>
                      <textarea
                        id="description"
                        placeholder="What's this payment for?"
                        value={description}
                        onChange={handleDescriptionChange}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="text-lg font-semibold mb-4">
                        Confirm Transfer
                      </h3>

                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-semibold">{selectedUser?.name || recipient}</span>
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold">
                          ${amountValue.toFixed(2)}
                        </span>
                      </div>

                      {description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Description
                          </span>
                          <span className="font-semibold">{description}</span>
                        </div>
                      )}
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
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
                      >
                        {isSubmitting ? (
                          "Processing..."
                        ) : (
                          <span className="flex items-center gap-1">
                            Confirm <ArrowRight className="h-4 w-4" />
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

      {/* Payment Card Selection Dialog */}
      {showCardDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => handleCardDialogClose(false)}></div>
          <div className="relative bg-background rounded-lg border shadow-lg w-full max-w-md mx-4 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Select Payment Method</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which card to use for this payment or proceed with instant transfer.
              </p>
            </div>
            
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-3">
                {paymentCards.map((card) => (
                  <div key={card.id} className="flex items-center space-x-3 rounded-md border p-3">
                    <input
                      type="radio"
                      value={card.id}
                      id={card.id}
                      name="selectedCard"
                      checked={selectedCard === card.id}
                      onChange={(e) => handleCardChange(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor={card.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded ${card.cardColor}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{card.name}</span>
                            {card.isDefault && (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                <Check className="h-3 w-3 mr-1" />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                        </div>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between gap-3 pt-2">
              <button 
                onClick={handleProceedWithCard}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
                disabled={!selectedCard}
              >
                Use Selected Card
              </button>
              
              <button 
                onClick={handleInstantPayment}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
              >
                Instant Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;