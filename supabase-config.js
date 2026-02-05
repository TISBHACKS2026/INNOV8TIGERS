/**
 * Supabase Authentication System for UrbisX
 * Complete production-ready authentication with Supabase
 */

// Supabase configuration - UPDATE THESE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://iznxefvnutwlzfemuulh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bnhlZnZudXR3bHpmZW11dWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Njk0MTUsImV4cCI6MjA3ODM0NTQxNX0._9yKHNsgDAKDi8DYTWniMhg10SKVdlHFHOL0BToYZ_M';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Main Authentication Class
class SupabaseAuth {
    constructor() {
        this.client = supabaseClient;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        try {
            // Get current session
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                console.log('User authenticated:', session.user.email);
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('No active session found');
            }
            
            this.updateUI();

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                
                if (session) {
                    this.currentUser = session.user;
                    this.isAuthenticated = true;
                    console.log('User signed in:', session.user.email);
                } else {
                    this.currentUser = null;
                    this.isAuthenticated = false;
                    console.log('User signed out');
                }
                
                this.updateUI();
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.isAuthenticated = false;
            this.currentUser = null;
        }
    }

    // Sign Up
    async signUp(email, password, userData = {}) {
        try {
            console.log('Attempting signup for:', email);
            
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: userData.firstName || '',
                        last_name: userData.lastName || ''
                    },
                    emailRedirectTo: `${window.location.origin}/index.html`
                }
            });

            console.log('Signup response:', { data, error });

            if (error) {
                console.log('Signup error details:', error);
                
                // Handle specific error cases for duplicate emails
                if (error.message.includes('User already registered') || 
                    error.message.includes('already been registered') ||
                    error.message.includes('email address is already registered') ||
                    error.message.includes('Email rate limit exceeded') ||
                    error.message.includes('signup_disabled') ||
                    error.message.includes('A user with this email address has already been registered') ||
                    error.message.includes('duplicate key value') ||
                    error.status === 422) {
                    return { 
                        success: false, 
                        error: 'An account with this email already exists. Please sign in instead or check your email for a confirmation link.' 
                    };
                }
                throw error;
            }

            // If we get a user but no session, it means email confirmation is required
            if (data.user && !data.session) {
                console.log('Email confirmation required for:', email);
                return { 
                    success: true, 
                    data,
                    requiresConfirmation: true,
                    message: 'Please check your email and click the confirmation link to complete your registration.' 
                };
            }

            // If we get both user and session, signup was successful and user is logged in
            if (data.user && data.session) {
                console.log('Signup successful with immediate login for:', email);
                return { success: true, data };
            }

            // This shouldn't happen, but handle edge case
            console.log('Unexpected signup response for:', email);
            return { success: true, data };
            
        } catch (error) {
            console.error('Sign up error:', error);
            
            // Handle duplicate email error in catch block
            if (error.message.includes('User already registered') || 
                error.message.includes('already been registered') ||
                error.message.includes('email address is already registered') ||
                error.message.includes('Email rate limit exceeded') ||
                error.message.includes('signup_disabled') ||
                error.message.includes('A user with this email address has already been registered') ||
                error.message.includes('duplicate key value') ||
                error.status === 422) {
                return { 
                    success: false, 
                    error: 'An account with this email already exists. Please sign in instead or check your email for a confirmation link.' 
                };
            }
            
            return { success: false, error: error.message };
        }
    }

    // Sign In
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            // Redirect to home page
            window.location.href = 'index.html';
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Reset Password
    async resetPassword(email) {
        try {
            const { error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get Current User
    getCurrentUser() {
        if (!this.currentUser) return null;

        return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            firstName: this.currentUser.user_metadata?.first_name || 'User',
            lastName: this.currentUser.user_metadata?.last_name || '',
            emailVerified: this.currentUser.email_confirmed_at !== null,
            createdAt: this.currentUser.created_at
        };
    }

    // Route Protection
    requireAuth() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }

    // Update UI
    updateUI() {
        if (typeof updateAuthNavigation === 'function') {
            updateAuthNavigation();
        }
    }

    // Email Validation
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Check if email already exists (for client-side validation)
    async checkEmailExists(email) {
        try {
            // Attempt to sign in with a dummy password to check if email exists
            // This is safer than triggering password reset emails
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password: 'dummy-check-password-123'
            });
            
            if (error) {
                // If error is "Invalid login credentials", email might not exist
                if (error.message.includes('Invalid login credentials')) {
                    return { exists: false };
                }
                
                // If error is about email not confirmed, user exists but not verified
                if (error.message.includes('Email not confirmed') ||
                    error.message.includes('signup_disabled') ||
                    error.message.includes('User already registered')) {
                    return { exists: true };
                }
                
                // For other errors, assume email might exist to be safe
                return { exists: true, error: error.message };
            }
            
            // If successful login (shouldn't happen with dummy password), email exists
            if (data.user) {
                // Sign out immediately since this was just a check
                await this.client.auth.signOut();
                return { exists: true };
            }
            
            return { exists: false };
            
        } catch (error) {
            console.error('Email check error:', error);
            // On error, assume email might exist to be safe
            return { exists: true, error: error.message };
        }
    }

    // Password Validation
    validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('One uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('One lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('One number');
        }

        const strength = Math.max(0, 4 - errors.length);
        const levels = ['weak', 'weak', 'fair', 'good', 'strong'];
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: strength,
            level: levels[strength]
        };
    }

    // Tour Management
    async hasSeenTour() {
        if (!this.currentUser) return true;
        try {
            const tourSeen = localStorage.getItem(`tour_seen_${this.currentUser.id}`);
            return tourSeen === 'true';
        } catch (error) {
            return true;
        }
    }

    async markTourAsSeen() {
        if (!this.currentUser) return;
        try {
            localStorage.setItem(`tour_seen_${this.currentUser.id}`, 'true');
        } catch (error) {
            console.error('Mark tour as seen error:', error);
        }
    }

    isNewUser() {
        if (!this.currentUser) return false;
        const createdAt = new Date(this.currentUser.created_at);
        const now = new Date();
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        return hoursDiff < 24;
    }
}

// Database Manager (optional - for advanced features)
class SupabaseDB {
    constructor() {
        this.client = supabaseClient;
    }

    async logUserActivity(activity) {
        try {
            const { error } = await this.client
                .from('user_activities')
                .insert([{
                    user_id: auth.currentUser?.id,
                    activity_type: activity.type,
                    activity_data: activity.data,
                    timestamp: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Log activity error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize global instances
const auth = new SupabaseAuth();
const db = new SupabaseDB();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { auth, db, supabaseClient };
}
