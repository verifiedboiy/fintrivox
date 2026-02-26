import React from 'react';
import { ShieldAlert, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const SuspendedScreen: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
            <div className="max-w-md w-full bg-card border border-destructive/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <ShieldAlert className="w-10 h-10 text-destructive" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Account Suspended</h1>
                    <p className="text-muted-foreground mb-8">
                        Your account has been frozen and access is currently restricted.
                    </p>

                    <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left border border-border/50">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground/80">
                            <Lock className="w-4 h-4" />
                            Reason for Suspension
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                            "{user?.suspensionReason || 'No specific reason provided by administration.'}"
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary font-medium p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <Mail className="w-5 h-5" />
                            <a href="mailto:support@fintrivox.com" className="hover:underline">
                                support@fintrivox.com
                            </a>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Please contact our support team for assistance or to file an appeal.
                            Be sure to include your account email in the correspondence.
                        </p>

                        <div className="pt-4 border-t border-border/50">
                            <Button
                                variant="ghost"
                                onClick={logout}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Sign out of account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuspendedScreen;
