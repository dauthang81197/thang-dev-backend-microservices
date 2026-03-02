import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ENVIRONMENT } from '../../env/environment';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || ENVIRONMENT.google.clientId,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || ENVIRONMENT.google.clientSecret,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || ENVIRONMENT.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName || null,
      lastName: name?.familyName || null,
      fullName: profile.displayName || null,
      avatar: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}

