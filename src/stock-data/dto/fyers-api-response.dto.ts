export class FyersApiResponseDTO<T>  {
    s: "ok" | "error";
    candles?: T[];
    data?: T;
    message?: T;
    code?: number;
    d?: T
}