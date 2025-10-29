import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { toast } from 'sonner'
import client from "@/api/client" // Assuming your Supabase client import

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      // Supabase Sign In (Login)
      const { error } = await client.auth.signInWithPassword({
        email, 
        password,
      });

      if (error) {
        // Supabase often returns vague error messages for security (e.g., "Invalid login credentials")
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success('Login successful! Welcome back.');
        // Optional: Redirect the user to their dashboard or clear fields
        setEmail('');
        setPassword('');
      }

    } catch (err) {
      toast.error('An unexpected error occurred during login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- Forgot Password Handler ---
  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning('Please enter your email address to receive the password reset link.');
      return;
    }

    try {
      // Supabase Password Reset Function
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Replace with your actual password update page URL
      });

      if (error) {
        toast.error(`Password reset failed: ${error.message}`);
      } else {
        toast.success('Password reset link sent! Check your email inbox.');
      }
    } catch (err) {
      toast.error('An error occurred while sending the reset link.');
      console.error(err);
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <button
              type="button" // Use type="button" to prevent form submission
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
          
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging In...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default Login