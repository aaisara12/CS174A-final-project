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

const ArcherAim = components.ArcherAim = 
    class ArcherAim extends Component{
        update(time, deltaTime)
        {
            
        }
    }