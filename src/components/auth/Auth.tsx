import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";
import Signup from "./Signup";
import React from 'react';

export interface AuthComponentProps {
    onSuccess: () => void;
}

const LoginComponent = Login as React.FC<AuthComponentProps>;
const SignupComponent = Signup as React.FC<AuthComponentProps>;

interface AuthProps extends AuthComponentProps {}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl transition-all duration-300">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-sm text-gray-500">Sign in or create an account to continue.</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 font-semibold"
                    >
                        Login
                    </TabsTrigger>
                    <TabsTrigger
                        value="signup"
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 font-semibold"
                    >
                        Sign Up
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <div className="mt-6">
                        <LoginComponent onSuccess={onSuccess} />
                    </div>
                </TabsContent>

                <TabsContent value="signup">
                    <div className="mt-6">
                        <SignupComponent onSuccess={onSuccess} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Auth;