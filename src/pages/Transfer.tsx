import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";

// Type definitions
type PlatformType = "paypal" | "payoneer" | "stripe";
type PlatformActionType = "selected" | "instant";

interface TransferFormData {
  recipient: string;
  amount: string;
  description: string;
}

const Transfer: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance, transfer } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  
  // New states for payment platform selection
  const [showPlatformDialog, setShowPlatformDialog] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("paypal");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

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

    // Open the platform selection dialog instead of proceeding directly
    setShowPlatformDialog(true);
  };

  const handleReset = (): void => {
    setStep(1);
    setRecipient("");
    setAmount("");
    setDescription("");
    setTransferSuccess(false);
  };

  const handlePlatformSelect = async (option: PlatformActionType): Promise<void> => {
    // Option can be either "selected" to proceed to the selected platform 
    // or "instant" for instant payment
    setShowPlatformDialog(false);
    setIsSubmitting(true);

    try {
      if (option === "instant") {
        // Process the transfer directly
        const success = await transfer(recipient, amountValue, description);
        if (success) {
          setTransferSuccess(true);
        }
      } else {
        // In a real app, you'd redirect to the selected platform
        // For demo purposes, we'll simulate success after a short delay
        setTimeout(() => {
          toast({
            title: `Redirecting to ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}`,
            description: "You would normally be redirected to complete your payment.",
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
  };

  const handleNavigateToWallet = (): void => {
    navigate("/wallet");
  };

  const handlePlatformDialogClose = (open: boolean): void => {
    setShowPlatformDialog(open);
  };

  const handlePlatformChange = (value: string): void => {
    setSelectedPlatform(value as PlatformType);
  };

  const handleProceedToPlatform = (): void => {
    handlePlatformSelect("selected");
  };

  const handleInstantPayment = (): void => {
    handlePlatformSelect("instant");
  };

  return (
    <div className="min-h-screen pb-16">
      <AnimatedBackground />

      <div className="container px-4 pt-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle>
              {transferSuccess ? "Transfer Complete" : "Send Money"}
            </CardTitle>
            <CardDescription>
              {transferSuccess
                ? "Your money has been sent successfully."
                : "Transfer funds to another SmartPay user."}
            </CardDescription>
          </CardHeader>

          <CardContent>
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
                    <span className="font-semibold">{recipient}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-semibold">{description}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleReset}>New Transfer</Button>
                  <Button variant="outline" onClick={handleNavigateToWallet}>
                    Back to Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">
                        Recipient Email or Phone
                      </Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="email@example.com or phone number"
                        value={recipient}
                        onChange={handleRecipientChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Demo recipients: jane@example.com or john@example.com
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        min="1"
                        step="any"
                        value={amount}
                        onChange={handleAmountChange}
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
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="What's this payment for?"
                        value={description}
                        onChange={handleDescriptionChange}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="text-lg font-semibold mb-4">
                        Confirm Transfer
                      </h3>

                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-semibold">{recipient}</span>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToStep1}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Back
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          "Processing..."
                        ) : (
                          <span className="flex items-center gap-1">
                            Confirm <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Platform Selection Dialog */}
      <Dialog open={showPlatformDialog} onOpenChange={handlePlatformDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Platform</DialogTitle>
            <DialogDescription>
              Choose how you would like to process this payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedPlatform}
              onValueChange={handlePlatformChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1 cursor-pointer">PayPal</Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="payoneer" id="payoneer" />
                <Label htmlFor="payoneer" className="flex-1 cursor-pointer">Payoneer</Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex-1 cursor-pointer">Stripe</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-between gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={handleProceedToPlatform}
              className="flex-1"
            >
              Proceed to Platform
            </Button>
            
            <Button 
              onClick={handleInstantPayment}
              className="flex-1"
            >
              Instant Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transfer;