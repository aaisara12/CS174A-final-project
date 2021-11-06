import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


// Unity-inspired actor class 
class GameObject
{
    constructor(model, start_transform, components, material)
    {
        this.model = model;
        this.transform = new Transform(start_transform);
        this.components = components;
        this.material = material;
        
        for(let i = 0; i < components.length; i++)
        {
            this.components[i].initialize(this);
        }
        
    }
    
    // DO NOT OVERRIDE
    update(time, deltaTime)
    {
        // Run update function for every component attached to this GameObject
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].update(time, deltaTime);
        }
    }
    
    // DO NOT OVERRIDE
    draw(context, program_state)
    {
        this.model.draw(context, program_state, this.transform.model_transform, this.material);
    }
}

// Unity-inspired transform management class
class Transform
{
    constructor(start_transform)
    {
        this.model_transform = start_transform;
    }
    
    // Translate the transform relative to the world coordinate system (not relative to its parent)
    translate(dx, dy, dz)
    {
        this.model_transform = Mat4.translation(dx, dy, dz).times(this.model_transform);
    }
}

export {GameObject};