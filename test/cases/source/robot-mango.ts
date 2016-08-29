
module Fruit {


    export class RobotMango extends Mango {
        talk(){
            return "Hello, I'm ROBO-" + this.name + ' the talking Robot Mango!';
        }
    }
}