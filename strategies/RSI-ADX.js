/*
	RSI Bull and Bear + ADX modifier
	1. Use different RSI-strategies depending on a longer trend
	2. But modify this slighly if shorter BULL/BEAR is detected
	-
	12 feb 2017
	-
	(CC-BY-SA 4.0) Tommie Hansen
	https://creativecommons.org/licenses/by-sa/4.0/
*/

// req's
var moment = require('moment');
var log = require ('../core/log.js');
var config = require ('../core/util.js').getConfig();
var BEAR = 'BEAR';
var BULL = 'BULL';

// strategy
var strat = {
	
	/* INIT */
	init: function()
	{
		this.name = 'RSI Bull and Bear + ADX';
		this.requiredHistory = config.tradingAdvisor.historySize;
		this.resetTrend();
		this.debug = true;
		
		// performance
		config.backtest.batchSize = 1000; // increase performance
		config.silent = true;
		config.debug = false;
		
		this.currentTrendRSIArray = [];
		this.currentTrendPriceArray = [];
		this.currentTrendMADiffArray = [];
		this.currentTrend = undefined;
		this.adjustTrend = undefined;

		this.wave = 1;

		// SMA
		this.addTulipIndicator('maSlow', 'sma', { optInTimePeriod: this.settings.SMA_long });
		this.addTulipIndicator('maFast', 'sma', { optInTimePeriod: this.settings.SMA_short });
		
		// RSI
		this.addTulipIndicator('RSI', 'rsi', { optInTimePeriod: this.settings.RSI });
		
		// ADX
		this.addTulipIndicator('ADX', 'adx', { optInTimePeriod: this.settings.ADX })
		
		// debug stuff
		this.startTime = new Date();
		
		// add min/max if debug
		if( this.debug ){
			this.stat = {
				adx: { min: 1000, max: 0 },
				bear: { min: 1000, max: 0 },
				bull: { min: 1000, max: 0 }
			};
		}
		
	},
	
	/* RESET TREND */
	resetTrend: function()
	{
		var trend = {
			duration: 0,
			direction: 'none',
			longPos: false,
		};
	
		this.trend = trend;
	},
	
	/* get low/high for backtest-period */
	lowHigh: function( val, type )
	{
		let cur;
		if( type == 'bear' ) {
			cur = this.stat.bear;
			if( val < cur.min ) this.stat.bear.min = val; // set new
			else if( val > cur.max ) this.stat.bear.max = val;
		}
		else if( type == 'bull' ) {
			cur = this.stat.bull;
			if( val < cur.min ) this.stat.bull.min = val; // set new
			else if( val > cur.max ) this.stat.bull.max = val;
		}
		else {
			cur = this.stat.adx;
			if( val < cur.min ) this.stat.adx.min = val; // set new
			else if( val > cur.max ) this.stat.adx.max = val;
		}
	},
	
	/* CHECK */
	check: function(candle)
	{
		this.candle = candle;
		// get all indicators
		let ind = this.tulipIndicators,
			maSlow = ind.maSlow.result.result,
			maFast = ind.maFast.result.result,
			rsi = ind.RSI.result.result,
			adx = ind.ADX.result.result,
			maDiff = maFast-maSlow;

		let rsi_hi, rsi_low;

		if(isNaN(adx)){
			adx= this.settings.ADX_high + 1;
		}

		if(this.adjustTrend === BEAR){
			if(maFast < maSlow) {
				this.adjustTrend = false;
				this.isTrendReversed = true;
			}
			this.currentTrend = BEAR;
		}else if(this.adjustTrend === BULL){
			if(maFast > maSlow) {
				this.adjustTrend = false;
				this.isTrendReversed = true;
			}
			this.currentTrend = BULL;
		}else if(maFast < maSlow){
			this.isTrendReversed = this.currentTrend !== BEAR;
			this.currentTrend = BEAR;
		} else if (maFast > maSlow){
			this.isTrendReversed = this.currentTrend !== BULL;
			this.currentTrend = BULL;
		}

		if(this.isTrendReversed){
			if (this.currentTrendRSIArray.length) {
				var sum = this.currentTrendRSIArray ? this.currentTrendRSIArray.reduce((a,b) => a+b) : 0,
					avg = sum / this.currentTrendRSIArray.length;
				console.log('Previous trend avg:', avg);
				console.log('Previous trend highest:', this.currentTrendHigh);
				console.log(this.wave++);
			}
			this.adjustTrend = false;
			this.currentTrendRSIArray = [];
			this.currentTrendMADiffArray = [];
			this.currentTrendHigh = maDiff;
			this.trendStartTime = candle.start;
		}

		// set the beginning trend
		if(!this.currentTrendMADiffArray) {
			this.currentTrendMADiffArray = [];
		}

		this.currentTrendMADiffArray.push(maDiff);
		this.currentTrendRSIArray.push(rsi);

		if(this.adjustTrend){
			console.log(this.adjustTrend);
			console.log(candle.start);
		}
		
		// BEAR TREND
		if( this.currentTrend === BEAR )
		{
			if (rsi > 75) {
				this.adjustTrend = BULL;
			}
			rsi_hi = this.settings.BEAR_RSI_high,
			rsi_low = this.settings.BEAR_RSI_low;
			if(maDiff < this.currentTrendHigh) this.currentTrendHigh = maDiff;
			
			// ADX trend strength?
			if( adx > this.settings.ADX_high ){
				rsi_low = rsi_low - this.settings.VOLATILITY;
				rsi_hi = rsi_hi - this.settings.VOLATILITY;
			}
			
			if( rsi > rsi_hi ) this.short(rsi);
			else if( rsi < rsi_low ) this.long(rsi);
			
			if(this.debug) this.lowHigh( rsi, 'bear' );
		}

		// BULL TREND
		else
		{	
			rsi_hi = this.settings.BULL_RSI_high,
			rsi_low = this.settings.BULL_RSI_low;
			if (rsi < 20) {
				this.adjustTrend = BEAR;
			}
			
			if(maDiff > this.currentTrendHigh) this.currentTrendHigh = maDiff;
			
			// ADX trend strength?
			if( adx > this.settings.ADX_high ){
				rsi_low = rsi_low + this.settings.VOLATILITY;
				rsi_hi = rsi_hi + this.settings.VOLATILITY;
			}	
				
			if( rsi > rsi_hi ) this.short(rsi);
			else if( rsi < rsi_low )  this.long(rsi);
			if(this.debug) this.lowHigh( rsi, 'bull' );
		}
		
		// add adx low/high if debug
		if( this.debug ) this.lowHigh( adx, 'adx');
	
	},
	
	/* LONG */
	long: function(rsi)
	{
		if( this.trend.direction !== 'up' ) // new trend? (only act on new trends)
		{
			this.resetTrend();
			this.trend.direction = 'up';
			this.advice('long');

			// if( this.debug ){
			// 	log.info('BUY!!!!!!!!!!!!!!!!!!!');
			// 	this.candleLog();
			// 	log.info(`ADX: ${this.tulipIndicators.ADX.result.result}`);
			// 	log.info(`RSI: ${rsi}`);
			// }
		}
	},

	candleLog: function () {
		log.info(`Time: ${this.candle.start}`);
		log.info(`Price: ${this.candle.close}`);
	},
	
	/* SHORT */
	short: function(rsi)
	{
		// new trend? (else do things)
		if( this.trend.direction !== 'down' )
		{
			this.resetTrend();
			this.trend.direction = 'down';
			this.advice('short');
			// if( this.debug ){
			// 	log.info('SELL!!!!!!!!!!!!!!!!!!!');
			// 	this.candleLog();
			// 	log.info(`ADX: ${this.tulipIndicators.ADX.result.result}`);
			// 	log.info(`RSI: ${rsi}`);
			// }
		}
	},
	
	/* END backtest */
	end: function()
	{
		let seconds = ((new Date()- this.startTime)/1000),
			minutes = seconds/60,
			str;
			
		minutes < 1 ? str = seconds.toFixed(2) + ' seconds' : str = minutes.toFixed(2) + ' minutes';
		
		log.info('====================================');
		log.info('Finished in ' + str);
		log.info('====================================');
	
		// print stats and messages if debug
		if(this.debug)
		{
			let stat = this.stat;
			log.info('BEAR RSI low/high: ' + stat.bear.min + ' / ' + stat.bear.max);
			log.info('BULL RSI low/high: ' + stat.bull.min + ' / ' + stat.bull.max);
			log.info('ADX min/max: ' + stat.adx.min + ' / ' + stat.adx.max);
		}
		
	}
	
};

module.exports = strat;