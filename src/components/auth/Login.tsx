import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { toast } from 'sonner'
import client from "@/api/client"
import { AuthComponentProps } from './Auth';

const Login: React.FC<AuthComponentProps> = ({ onSuccess }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await client.auth.signInWithPassword({
        email, 
        password,
      });

      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success('Login successful! Welcome back.');
        onSuccess(); 
        
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning('Please enter your email address to receive the password reset link.');
      return;
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
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
    <Card className="w-[350px] bg-gray-800/90 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400 border-b border-gray-700 pb-2">Login</CardTitle>
        <CardDescription className="text-gray-300">Sign in to your account</CardDescription>
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
          
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-green-400 hover:text-green-500 hover:underline"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
          
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" disabled={loading}>
            {loading ? 'Logging In...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default Login