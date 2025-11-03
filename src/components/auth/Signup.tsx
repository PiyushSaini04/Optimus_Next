import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { toast } from 'sonner'
import client from "@/api/client"
import { AuthComponentProps } from './Auth';

const Signup: React.FC<AuthComponentProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setconfirmPassword] = useState('');
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !name || !confirmpassword) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name } // Used by trigger
        }
      });

      if (error) {
        toast.error(`Signup failed: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        if (!data.session) {
          toast.success('Registration successful! Please check your email to confirm.');
        } else {
          toast.success('Signup successful! Welcome.');
          onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error during signup.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-[350px] bg-gray-800/90 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400 border-b border-gray-700 pb-2">Sign Up</CardTitle>
        <CardDescription className="text-gray-300">Create a new account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label> 
            <Input 
              id="name" 
              type="text" 
              placeholder="Enter your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmpassword">Cponfirm Password</Label>
            <Input 
              id="confirmpassword" 
              type="password" 
              placeholder="Confirm your password" 
              value={confirmpassword}
              onChange={(e) => setconfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" disabled={loading}>
            {loading ? 'Signing Up...' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default Signup