import {Component} from "./component.js";

export class TestMovement extends Component
{
    update(time, deltaTime)
    {
        this.gameObject.transform.translate(-deltaTime, deltaTime, 0);
    }
}

export class FallDown extends Component
{
    update(time, deltaTime)
    {
        this.gameObject.transform.translate(0, -2*deltaTime, 0);
    }
}


export class StayStill extends Component
{
    update(time, deltaTime)
    {
        // this.gameObject.transform.translate(-deltaTime, deltaTime, 0);
        this.gameObject.transform.translate(0, 0, 0);
    }
}
