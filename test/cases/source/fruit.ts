// All the best fruit you can find!
module Fruit {

	export enum Color {
		GREEN,
		YELLOW,
		BLACK
	}

	export class Mango {
		name: string;

		constructor(name: string) {
			this.name = name;
		}

		talk() {
			return "Hello, I'm " + this.name + ' the talking Mango!';
		}
	}

	export class Peeler {

		// ultimate peeler!
		static peelBanana(banana: Banana) {
			banana.isPeeled = true;
			return banana;
		}
	}
}

interface Banana {
	color: Fruit.Color;
	isPeeled: boolean;
}