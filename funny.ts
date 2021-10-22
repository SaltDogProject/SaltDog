class dominikwei implements Coder {
    private sleepTime = 0;
    private remain_days = 100 * 365;
    private next_target = '';
    construct() {
        while (remain_days > 0) {
            // 从出生开始就coding
            this.getUp();
            this.coding();
            this.eat();
            this.coding();
            this.eat();
            this.coding();
            this.sleep();
            next_target = Math.random(); // 有不同的发展
        }
    }
    private getUp() {
        if (sleepTime < 8 || roomTemperature < 10) {
            console.log('I want to sleep for another 10 minutes');
            setInterval(this.getUp, 10 * 60);
        } else {
            goToBathRoom();
            this.sleepTime = 0;
        }
    }
    private coding() {
        try {
            sloveProblems();
        } catch (difficuties) {
            // 解决问题
            let brain = require('working-hard');
            brain.slove(difficuties);
        }
    }
    private sleep() {
        console.log('zzzzz');
    }
    private eat() {
        console.log('I am hungry');
        let menu = gotoCanteen().getMenu;
        for (let dish in menu) {
            if (isHot(dish)) continue;
            else {
                takeDish(dish);
            }
        }
        goBackTowork();
    }
}
