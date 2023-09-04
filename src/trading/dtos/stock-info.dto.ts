import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsAlphanumeric, IsNotEmpty, ValidateIf, Min } from "class-validator";
import { DhaanConstants } from "src/dhaan/config/dhaanConstants.constant";

export class StockInfo {
    constructor(data: Partial<StockInfo>) {
        // this.securityId = undefined;
    }

    @ApiProperty( {
        type: String,
        description: "Name of the stock.",
        examples: [ "IDFC", "VENUSPIPES" ],
    } )
    @IsAlphanumeric()
    @IsNotEmpty( {
        message: "Trading symbol should not be empty",
    } )
    @ValidateIf( ( symbol: string ): boolean => {
        let flag: boolean = false;
        switch ( symbol ) {
            case DhaanConstants.brokerName:
            case "zerodha":
            case "fyers":
            case "angel":
                flag = true;
                break;
            default:
                break;
        }
        return flag;
    } )
    @Expose()
    private _tradingSymbol!: string;

    public get tradingSymbol (): string {
        return this._tradingSymbol;
    }
    public set tradingSymbol ( value: string ) {
        this._tradingSymbol = value;
    }

    @ApiProperty( {
        type: String,
        description: "This is an unique code that helps to indentify a company which is listed in the Indian stock market.",
        example: "INE480C01020",
    } )
    private _isin!: string; // this value uniquely indentifies all the shares
    
    public get isin (): string {
        return this._isin;
    }
    public set isin ( value: string ) {
        this._isin = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    private _securityId!: number;

    public get securityId (): number {
        return this._securityId;
    }
    public set securityId ( value: number ) {
        this._securityId = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    @Min( 1, {
        message: "total quantity of any holding stock cannot be less than 1",
    } )
    @Expose()
    private _totalQty!: number;

    public get totalQty (): number {
        return this._totalQty;
    }
    public set totalQty ( value: number ) {
        this._totalQty = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    @Min( 1, {
        message: "total average price of any holding stock cannot be less than 1",
    } )
    @Expose()
    private _avgCostPrice!: number;

    public get avgCostPrice (): number {
        return this._avgCostPrice;
    }
    public set avgCostPrice ( value: number ) {
        this._avgCostPrice = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    @Min( 1, {
        message: "total closing prioce of any holding stock cannot be less than 1",
    } )
    @Exclude()
    private _closingPrice!: number;

    public get closingPrice (): number {
        return this._closingPrice;
    }
    public set closingPrice ( value: number ) {
        this._closingPrice = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    @Exclude() // this property lets the DTO know that what are the fields that should be exposed to its viewers
    private _pnl!: number;

    public get pnl (): number {
        return this._pnl;
    }
    public set pnl ( value: number ) {
        this._pnl = value;
    }

    @ApiProperty( {
        type: Number,
    } )
    // @Exclude()
    @Expose() // as it is not being mapped, so the undefined value wont be visible
    private _percentagePnl!: number;

    public get percentagePnl (): number {
        return this._percentagePnl;
    }
    public set percentagePnl ( value: number ) {
        this._percentagePnl = value;
    }

    toString(): string {
        return `
            StockInfo {
                tradingSymbol: ${this.tradingSymbol},
                isin: ${this.isin},
                securityId: ${this.securityId},
                totalQty: ${this.totalQty},
                avgCostPrice: ${this.avgCostPrice},
                closingPrice: ${this.closingPrice},
                pnl: ${this.pnl},
                percentagePnl: ${this.percentagePnl}
            }`;
    }
}
// what I am getting is exact dhaanr response, but this stockInfo should be independant of all the broker
