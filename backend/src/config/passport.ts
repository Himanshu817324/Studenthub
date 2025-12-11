import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await User.findOne({ email: profile.emails?.[0].value });

                    if (user) {
                        // Update OAuth provider if not already present
                        const hasGoogleProvider = user.oauthProviders.some(
                            (p) => p.provider === 'google' && p.id === profile.id
                        );

                        if (!hasGoogleProvider) {
                            user.oauthProviders.push({ provider: 'google', id: profile.id });
                            await user.save();
                        }

                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0].value,
                        avatarUrl: profile.photos?.[0].value,
                        oauthProviders: [{ provider: 'google', id: profile.id }],
                        roles: ['user'],
                    });

                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy configured');
} else {
    console.log('ℹ️  Google OAuth not configured (missing credentials)');
}

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
