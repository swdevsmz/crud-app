import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  type SignUpCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoService {
  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('cognito.clientId', '');
    this.client = new CognitoIdentityProviderClient({
      region: this.configService.get<string>('cognito.region', 'ap-northeast-1'),
      endpoint: this.configService.get<string>('cognito.endpoint')
    });
  }

  async signUp(email: string, password: string): Promise<SignUpCommandOutput> {
    return this.client.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }]
      })
    );
  }
}
