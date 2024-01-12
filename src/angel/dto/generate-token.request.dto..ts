export default class GenerateTokenDto {
    refreshToken: string;

    constructor(entity: Partial<GenerateTokenDto>) {
        Object.assign(this, entity);
    }
}
