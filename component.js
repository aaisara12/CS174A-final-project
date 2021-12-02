const components = {};

export {components};


class Component
{
    initialize(gameObject)
    {
        this.gameObject = gameObject;
    }

    start()
    {
        // This should be overridden with custom logic
    }

    update(time, deltaTime)
    {
        // This should be overridden with custom logic
    }
}

///////////////
// COMPONENTS
///////////////

const FallDown = components.FallDown =
    class FallDown extends Component
    {
        update(time, deltaTime)
        {
            this.gameObject.transform.translate(0, -2*deltaTime, 0);
        }
    }

const StayStill = components.StayStill =
    class StayStill extends Component
    {
        update(time, deltaTime)
        {
            // this.gameObject.transform.translate(-deltaTime, deltaTime, 0);
            this.gameObject.transform.translate(0, 0, 0);
        }
    }

const Straight = components.Straight = 
    class Straight extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(10*deltaTime, 0, 0);
        }
    }

const InsideTop = components.InsideTop = 
    class InsideTop extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(18*deltaTime, 10*deltaTime, 0);
        }
    }

const Outside = components.Outside = 
    class Outside extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(17*deltaTime, 10*deltaTime, 0);
        }
    }

const OutsideRight = components.OutsideRight =
    class OutsideRight extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(17 * deltaTime, 0, 10* deltaTime);
        }
    }

const EdgeRight = components.EdgeRight =
    class EdgeRight extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(18 * deltaTime, 0, 10* deltaTime);
        }
    }

const TopRight = components.TopRight =
    class TopRight extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(20 * deltaTime, 10*deltaTime, 10* deltaTime);
        }
    }

const GravityTest = components.GravityTest =
    class GravityTest extends Component{
        update(time, deltaTime){
            if(time != 0 && deltaTime != 0){
                this.gameObject.dy += .005;
                // pass in power variable from user input, this is just arbitrary rn
                var POWER = .6;
                this.gameObject.transform.translate(POWER, -this.gameObject.dy , 0);
            }
        }
    }

const GravityTest2 = components.GravityTest2 =
    class GravityTest2 extends Component{
        constructor(power){
            super();
            this.power = power;
        }
        update(time, deltaTime){
            if(time != 0 && deltaTime != 0){
                this.gameObject.dy += .005;
                // pass in power variable from user input, this is just arbitrary rn
                // var POWER = .6;
                let scaled_power = Math.pow(this.power, .45) * .1;
                this.gameObject.transform.translate(scaled_power, -this.gameObject.dy , .1);
                // this.gameObject.transform.rotation(0,1,0);
                // console.log(scaled_power);
            }
        }
    }

const Projectile = components.Projectile =
    class Projectile extends Component{
        constructor(power)
        {
            super();
            this.gravity = -9.8;
            this.power = power;
        }

        start()
        {
            // Initialize physics values based on start direction and magnitude
            this.curr_velocity = this.gameObject.transform.right().times(this.power);
        }

        update(time, deltaTime)
        {
            this.curr_velocity[1] += this.gravity * deltaTime;
            this.gameObject.transform.translate(this.curr_velocity[0] * deltaTime, this.curr_velocity[1] * deltaTime, this.curr_velocity[2] * deltaTime, false);
        }
    }