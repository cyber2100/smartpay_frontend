import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { ArrowRight, CheckCircle2, User, DollarSign } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isverified?: boolean;
  is_admin?: boolean;
}

const Transfer: React.FC = () => {
  const { user , findUser } = useAuth();
  const { transfer: moneyTransfer, balance } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [verifiedUser, setVerifiedUser] = useState<UserSuggestion | null>(null);

  useEffect(() => {
    if(!user?.isVerified){
      navigate('/verify', {replace: false});
    }
  }, []);

  // Function to handle money transfer
  const transfer = async (recipient: string, amount: number, description: string) => {
    const response = await moneyTransfer(recipient, amount, description);
    return response;
  };

  // Function to verify if user exists in database
  const verifyUser = async (emailOrPhone: string): Promise<UserSuggestion | null> => {
    const foundUser = await findUser(emailOrPhone);

    if (
      foundUser &&
      typeof foundUser === "object" &&
      "id" in foundUser &&
      "email" in foundUser
    ) {
      return foundUser as UserSuggestion;
    }
    return null;
  };

  // Convert amount to a number for validation
  const amountValue: number = parseFloat(amount);

  // Handle form submission
  // This function handles both verification and transfer steps
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();

    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a recipient email or phone number.",
        variant: "destructive",
      });
      return;
    }

    // Step 1: Verify user before proceeding to confirmation
    if (step === 1) {
      setIsVerifying(true);
      
      try {
        const user = await verifyUser(recipient);
          
        if (user) {
          setVerifiedUser(user);
          setStep(2);
          toast({
            title: "User verified",
            description: `Transfer recipient: ${user.name}`,
          });
        } else {
          toast({
            title: "User not found",
            description: "The email or phone number is not registered with our service.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Verification failed",
          description: "Unable to verify recipient. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    // Step 2: Process the transfer
    if (step === 2) {
      setIsSubmitting(true);
      
      try {
        const success = await transfer(recipient, amountValue, description);
        if (success) {
          setTransferSuccess(true);
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
    }
  };

  const handleReset = (): void => {
    setStep(1);
    setRecipient("");
    setAmount("");
    setDescription("");
    setTransferSuccess(false);
    setVerifiedUser(null);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRecipient(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setDescription(e.target.value);
  };

  const handleBackToStep1 = (): void => {
    setStep(1);
    setVerifiedUser(null);
  };

  const handleNavigateToWallet = (): void => {
    navigate('/wallet');
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
              <div className={`w-8 h-px ml-4 ${
                stepNumber < step || (stepNumber === 2 && transferSuccess) ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                    <span className="font-semibold">{verifiedUser?.name || recipient}</span>
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
                    <div className="space-y-2">
                      <label htmlFor="recipient" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Recipient Email or Phone
                      </label>
                      <input
                        id="recipient"
                        type="text"
                        placeholder="Enter email or phone number"
                        value={recipient}
                        onChange={handleRecipientChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        disabled={isVerifying}
                      />
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
                        disabled={isVerifying}
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
                        disabled={isVerifying}
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isVerifying}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    >
                      {isVerifying ? "Verifying recipient..." : "Continue"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="text-lg font-semibold mb-4">
                        Confirm Transfer
                      </h3>

                      {verifiedUser && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-md mb-4">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">{verifiedUser.name}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{verifiedUser.email}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-semibold">{verifiedUser?.name || recipient}</span>
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
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
                      >
                        {isSubmitting ? (
                          "Processing Transfer..."
                        ) : (
                          <span className="flex items-center gap-1">
                            Confirm Transfer <ArrowRight className="h-4 w-4" />
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

export default Transfer;