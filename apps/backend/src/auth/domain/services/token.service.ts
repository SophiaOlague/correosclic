export abstract class TokenService {
  abstract generateAccessToken(payload: {
    sub: string;
    email: string;
  }): Promise<string>;
}