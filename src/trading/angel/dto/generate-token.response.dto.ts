import GenerateTokenDto from "./generate-token.request.dto.";

export default class GenerateTokenResponseDto extends GenerateTokenDto {
    jwtToken: string;
    feedToken: string;
}
