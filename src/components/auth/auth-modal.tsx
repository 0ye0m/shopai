'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, onAuthSuccess, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  // Signup state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setErrors({});
  }, [activeTab]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupData.name) {
      newErrors.name = 'Name is required';
    } else if (signupData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
        callbackUrl: '/',
      });
      
      if (result?.ok) {
        toast.success('Welcome back! You are now logged in.');
        onAuthSuccess?.();
        onOpenChange(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else if (result?.error) {
        toast.error(result.error || 'Invalid email or password. Please try again.');
      } else {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignup()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone || undefined,
          password: signupData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Account created successfully! Please log in.');
        setActiveTab('login');
        setLoginData({ ...loginData, email: signupData.email });
        setSignupData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
        setAgreedToTerms(false);
      } else {
        toast.error(data.error || 'Signup failed. Please try again.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      window.location.href = '/api/auth/signin/google';
    } catch {
      toast.error('Failed to initiate Google sign in');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset link has been sent to your email');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to ShopAI</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-none border-b bg-muted/30">
            <TabsTrigger 
              value="login" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-none"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-none"
            >
              Create Account
            </TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login" className="mt-0 p-6 space-y-4">
            <div className="space-y-1 text-center mb-4">
              <h2 className="text-xl font-semibold">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to continue shopping</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn("pl-10", errors.email && "border-destructive")}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <button 
                    type="button" 
                    className="text-xs text-primary hover:underline"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={loginData.rememberMe}
                  onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked as boolean })}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our{' '}
              <button className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </TabsContent>
          
          {/* Signup Tab */}
          <TabsContent value="signup" className="mt-0 p-6 space-y-4">
            <div className="space-y-1 text-center mb-4">
              <h2 className="text-xl font-semibold">Create an account</h2>
              <p className="text-sm text-muted-foreground">Join ShopAI for exclusive deals</p>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className={cn("pl-10", errors.name && "border-destructive")}
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className={cn("pl-10", errors.email && "border-destructive")}
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-10"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                
                {/* Password strength indicator */}
                <div className="flex gap-1 mt-1">
                  {['uppercase', 'lowercase', 'number', '8+ chars'].map((req, i) => {
                    const isValid = [
                      /[A-Z]/.test(signupData.password),
                      /[a-z]/.test(signupData.password),
                      /\d/.test(signupData.password),
                      signupData.password.length >= 8
                    ][i];
                    return (
                      <div 
                        key={req}
                        className={cn(
                          "flex-1 h-1 rounded-full transition-colors",
                          signupData.password ? (isValid ? "bg-green-500" : "bg-muted") : "bg-muted"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={cn("pl-10 pr-10", errors.confirmPassword && "border-destructive")}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className={cn(errors.terms && "border-destructive")}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-tight">
                  I agree to the{' '}
                  <button type="button" className="text-primary hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </Label>
              </div>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            {/* Benefits */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Member benefits:</p>
              <div className="grid grid-cols-2 gap-2">
                {['Exclusive deals', 'Order tracking', 'Faster checkout', 'Wishlist sync'].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
