import { useEffect, useRef, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  Bell,
  BarChart3,
  Activity,
  Globe,
  Bitcoin,
  DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


const marketAssets = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', price: 43250, changePercent24h: 2.34, high24h: 43800, low24h: 42100, volume24h: 28500000000, marketCap: 845000000000 },
  { id: '2', name: 'Ethereum', symbol: 'ETH', type: 'crypto', price: 2280, changePercent24h: 1.87, high24h: 2310, low24h: 2230, volume24h: 15200000000, marketCap: 274000000000 },
  { id: '3', name: 'Solana', symbol: 'SOL', type: 'crypto', price: 98.5, changePercent24h: -0.82, high24h: 101.2, low24h: 96.8, volume24h: 2800000000, marketCap: 42000000000 },
  { id: '4', name: 'Apple', symbol: 'AAPL', type: 'stock', price: 182.63, changePercent24h: 0.54, high24h: 183.12, low24h: 181.80, volume24h: 54200000, marketCap: 2850000000000 },
  { id: '5', name: 'EUR/USD', symbol: 'EURUSD', type: 'forex', price: 1.0876, changePercent24h: -0.12, high24h: 1.0892, low24h: 1.0860, volume24h: 180000000000, marketCap: 0 },
  { id: '6', name: 'Gold', symbol: 'XAU', type: 'commodity', price: 2035.4, changePercent24h: 0.23, high24h: 2042.1, low24h: 2028.7, volume24h: 23100000000, marketCap: 0 },
  { id: '7', name: 'BNB', symbol: 'BNB', type: 'crypto', price: 310.2, changePercent24h: 3.15, high24h: 315.8, low24h: 302.1, volume24h: 1200000000, marketCap: 47600000000 },
  { id: '8', name: 'Tesla', symbol: 'TSLA', type: 'stock', price: 245.12, changePercent24h: -1.23, high24h: 248.90, low24h: 243.50, volume24h: 98700000, marketCap: 780000000000 },
];

// TradingView Advanced Chart Widget
function TradingViewAdvancedChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'NASDAQ:AAPL',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" style={{ height: '500px' }}>
      <div ref={containerRef} className="tradingview-widget-container__widget" style={{ height: '100%' }} />
    </div>
  );
}

// TradingView Market Overview Widget
function TradingViewMarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: '#2962FF',
      plotLineColorFalling: '#2962FF',
      gridLineColor: 'rgba(42, 46, 57, 0.06)',
      scaleFontColor: '#787B86',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: 'Indices',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' },
            { s: 'FOREXCOM:DJI', d: 'Dow Jones' },
            { s: 'INDEX:NKY', d: 'Nikkei 225' },
            { s: 'INDEX:DEU40', d: 'DAX' },
            { s: 'FOREXCOM:UKXGBP', d: 'FTSE 100' },
          ],
          originalTitle: 'Indices'
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
            { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
            { s: 'BINANCE:SOLUSD', d: 'Solana' },
            { s: 'BINANCE:BNBUSD', d: 'BNB' },
            { s: 'BINANCE:ADAUSD', d: 'Cardano' },
            { s: 'BINANCE:DOTUSD', d: 'Polkadot' },
          ],
          originalTitle: 'Crypto'
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:USDCHF', d: 'USD/CHF' },
            { s: 'FX:AUDUSD', d: 'AUD/USD' },
            { s: 'FX:USDCAD', d: 'USD/CAD' },
          ],
          originalTitle: 'Forex'
        },
        {
          title: 'Commodities',
          symbols: [
            { s: 'COMEX:GC1!', d: 'Gold' },
            { s: 'COMEX:SI1!', d: 'Silver' },
            { s: 'NYMEX:CL1!', d: 'Crude Oil' },
            { s: 'NYMEX:NG1!', d: 'Natural Gas' },
            { s: 'CBOT:ZC1!', d: 'Corn' },
            { s: 'CBOT:ZW1!', d: 'Wheat' },
          ],
          originalTitle: 'Commodities'
        }
      ]
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container h-[400px]" />;
}

// TradingView Ticker Tape
function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
        { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
        { proName: 'COMEX:GC1!', title: 'Gold' },
        { proName: 'NYMEX:CL1!', title: 'Crude Oil' },
      ],
      showSymbolLogo: true,
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container" />;
}

export default function Markets() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = marketAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Markets</h1>
          <p className="text-gray-500">Real-time market data and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Watchlist
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
        </div>
      </div>

      {/* Live Ticker */}
      <TradingViewTickerTape />

      {/* Main Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Advanced Chart
          </CardTitle>
          <Badge variant="secondary" className="text-green-600 bg-green-50">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewAdvancedChart />
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewMarketOverview />
        </CardContent>
      </Card>

      {/* Asset List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Assets</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Asset</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">24h Change</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">24h High</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">24h Low</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Volume</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.type === 'crypto' ? 'bg-orange-100 text-orange-600' :
                            asset.type === 'stock' ? 'bg-blue-100 text-blue-600' :
                              asset.type === 'forex' ? 'bg-green-100 text-green-600' :
                                'bg-yellow-100 text-yellow-600'
                          }`}>
                          {asset.type === 'crypto' ? <Bitcoin className="w-5 h-5" /> :
                            asset.type === 'stock' ? <BarChart3 className="w-5 h-5" /> :
                              asset.type === 'forex' ? <DollarSign className="w-5 h-5" /> :
                                <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 font-medium">
                      ${asset.price.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`flex items-center justify-end gap-1 ${asset.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {asset.changePercent24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {asset.changePercent24h >= 0 ? '+' : ''}
                        {asset.changePercent24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right py-4 px-4 text-gray-600">
                      ${asset.high24h.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4 text-gray-600">
                      ${asset.low24h.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4 text-gray-600">
                      {formatNumber(asset.volume24h)}
                    </td>
                    <td className="text-right py-4 px-4 text-gray-600">
                      {asset.marketCap ? formatNumber(asset.marketCap) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
