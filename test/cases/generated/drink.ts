module Drink {
	export class Juice {
		private _name: string;
		isSquash: boolean;

		constructor(name: string) {
			this._name = name;
		}

		pour() {
			console.log('Pouring ' + this._name);
		}
	}}