export const getTrailingStopLoss = (
    previousClose: number,
    avgCostPrice: number,
): string[] => {
    const pnl: number = (previousClose / avgCostPrice - 1) * 100;
    let sl: number;
    if (pnl < 10) {
        sl = getSl(4, avgCostPrice);
    } else if (pnl < 30) {
        sl = getSl(3, previousClose);
    } else if (pnl < 30) {
        sl = getSl(4, previousClose);
    } else if (pnl < 30) {
        sl = getSl(5, previousClose);
    } else {
        sl = getSl(7, previousClose);
    }

    return [sl.toFixed(2), getTriggerPrice(sl, 0.5).toFixed(2)];
};

const getSl = (percent: number, valueFrom: number): number =>
    valueFrom * (1 - percent / 100);

const getTriggerPrice = (slValue: number, percent: number): number =>
    slValue * (1 + percent / 100);

//todo ==> implement actual methods, that will fetch these data
export const getPublicIp = (): string => process.env.PUBLIC_IP;
export const getPrivateIp = (): string => process.env.PRIVATE_IP;
export const getMacAddress = (): string => process.env.MAC_ADDRESS;
