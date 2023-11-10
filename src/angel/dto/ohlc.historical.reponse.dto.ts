class AngelOHLCHistoricalResponseDTO {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;

    constructor(data: any[]) {
        this.timestamp = data[0];
        this.open = data[1];
        this.high = data[2];
        this.low = data[3];
        this.close = data[4];
        this.volume = data[5];
    }
}

export type AngelOHLCHistoricalType = [
    timestamp: string,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
]