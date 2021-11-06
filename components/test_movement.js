import {Component} from "./component.js";

export class TestMovement extends Component
{
    update(time, deltaTime)
    {
        this.gameObject.transform.translate(-deltaTime, deltaTime, 0);
    }
}