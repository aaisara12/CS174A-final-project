const components = {};

export {components};


class Component
{
    initialize(gameObject)
    {
        this.gameObject = gameObject;
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
        update(time, deltaTime){
            if(time != 0 && deltaTime != 0){
                this.gameObject.dy += .005;
                // pass in power variable from user input, this is just arbitrary rn
                var POWER = .6;
                this.gameObject.transform.translate(POWER, -this.gameObject.dy , .1);
            }
        }
    }
