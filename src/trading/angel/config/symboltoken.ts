export default interface SymbolToken {
    token: string,
    symbol: string,
    name: string,
    expiry: string,
    lotsize: string,
    instrumenttype: "OPTSTK" | "OPTIDX" | "",
    exch_seg: "NFO" | "NSE" | "BSE",
    tick_size: string,
}

// https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json