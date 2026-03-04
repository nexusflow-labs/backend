export class AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;

  static from(tokens: {
    accessToken: string;
    refreshToken: string;
  }): AuthTokensResponseDto {
    const dto = new AuthTokensResponseDto();
    dto.accessToken = tokens.accessToken;
    dto.refreshToken = tokens.refreshToken;
    return dto;
  }
}
