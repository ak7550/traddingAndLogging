import OhlcvDataDTO from "src/trading/dtos/ohlcv-data.dto";

interface Strategy {
    name: string;
    desc: string,
    type: "BUY" | "SELL";
    conditions: Array<(ohlcData: OhlcvDataDTO[]) => boolean | number>;
}

//todo
const isGapUp = (ohlcdata: OhlcvDataDTO[]): boolean => true;
// const notEquals = ( a: number, b: number ): boolean => a !== b;
const compareLast = (ohlcData: OhlcvDataDTO[], next): boolean => {
    const length = ohlcData.length;
    return next( ohlcData[ length - 2 ].low, ohlcData[ length - 2 ].open );
};

const percentageChange = ( a: number, b: number ): number => ( a / b - 1 ) * 100;

const strategies: Strategy[] = [
    {
        name: "open high sell strategy",
        desc: "",
        type: "SELL",
        conditions: [
            isGapUp,
            ( ohlcData: OhlcvDataDTO[] ): boolean => compareLast( ohlcData,
                ( a: number, b: number ): boolean => a !== b ),
            ( ohlc: OhlcvDataDTO[] ): boolean => {
                const length = ohlc.length;
                return ohlc[ length - 2 ].open > ohlc[ length - 3 ].close;
            },
            ( ohlc: OhlcvDataDTO[] ): boolean => {
                const length = ohlc.length;
                return ohlc[ length - 2 ].open > ohlc[ length - 2 ].close;
            },


        ]
    }
];

const s2: Strategy[] = [];


//todo: define the proper strategies with proper conditions, try to optimise the code as much as possible, use function currying

//todo: think how to traverse through all of the json codes work accordingly.