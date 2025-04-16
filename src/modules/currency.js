const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export class CurrencyConverter {
  constructor() {
    this.rates = null;
    this.lastUpdate = null;
    this.updateInterval = 1000 * 60 * 60;
  }

  async init() {
    await this.updateRates();
    setInterval(() => this.updateRates(), this.updateInterval);
  }

  async updateRates() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      this.rates = data.rates;
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
    }
  }

  convert(amount, fromCurrency, toCurrency = 'UAH') {
    if (!this.rates) return null;

    const inUSD = fromCurrency === 'USD'
      ? amount
      : amount / this.rates[fromCurrency];

    return inUSD * this.rates[toCurrency];
  }

  getAvailableCurrencies() {
    return this.rates ? Object.keys(this.rates) : [];
  }
}