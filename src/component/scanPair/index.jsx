import { useEffect } from 'react';
import { getKLines, searchPair } from '../../api/dexscreener/api';
import { getBestPrice } from '../../api/binance/api';
import { convertPairToPlainText } from '../../api/binance/helpers';
import { reducePairInDex } from '../../api/dexscreener/helpers';

const SYMBOLS = [
    'APT/USDT',
    'BNB/USDT',
    'ETH/USDT'
];

function ScanPair() {

    useEffect(() => {
        const getAvailablePairs = async() => {
            const pairsInDex = await Promise.allSettled(SYMBOLS.map(s => searchPair(s)));
            const bestPrices = await Promise.allSettled(SYMBOLS.map(s => {
                const symbol = convertPairToPlainText(s);
                return getBestPrice(symbol);
            }));

            const availablePairs = [];
            pairsInDex.forEach((pairs, index) => {
                if (pairs.status === 'rejected' || bestPrices[index].status === 'rejected') return;
                availablePairs.push(reducePairInDex(pairs.value, bestPrices[index].value.price));
            });
            console.log(availablePairs);
        };
        getAvailablePairs();
    }, []);

    return (
        <h1>ALLOO</h1>
    )
}

export default ScanPair;
