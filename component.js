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

const TestMovement = components.TestMovement =
    class TestMovement extends Component
    {
        update(time, deltaTime)
        {
            this.gameObject.transform.translate(-deltaTime, deltaTime, 0);
        }
    }

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

const ForwardDown = components.ForwardDown = 
    class ForwardDown extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(10*deltaTime, -.5*deltaTime, 0);
        }
    }

const RandomDirection = components.RandomDirection = 
    class RandomDirection extends Component{
        update(time, deltaTime){
            var randomFactor = Math.random() * (10 - 5) + 5;
            this.gameObject.transform.translate(randomFactor * 2 * deltaTime, randomFactor * deltaTime, 0);
        }
    }

const Outside = components.Outside = 
    class Outside extends Component{
        update(time, deltaTime){
            this.gameObject.transform.translate(15*deltaTime, 10*deltaTime, 0);
        }
    }
